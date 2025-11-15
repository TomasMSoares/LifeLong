'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { storeImage, getImageUrl, deleteImage } from '@/lib/imageDB';

export default function ImageUpload({ onImagesChange, maxImages = 5, initialImageIds = [] }) {
  const [imageIds, setImageIds] = useState(initialImageIds);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Load preview URLs for initial images on mount
  useEffect(() => {
    const loadPreviews = async () => {
      if (initialImageIds.length === 0) return;
      
      setIsLoading(true);
      try {
        const urls = await Promise.all(
          initialImageIds.map(id => getImageUrl(id))
        );
        setPreviewUrls(urls.filter(url => url !== null));
        setImageIds(initialImageIds);
      } catch (err) {
        console.error('Failed to load image previews:', err);
        setError('Some images failed to load');
      } finally {
        setIsLoading(false);
      }
    };

    loadPreviews();

    // Cleanup: revoke all preview URLs on unmount
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []); // Only run once on mount

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - imageIds.length;
    if (remainingSlots <= 0) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    setError('');

    try {
      const newImageIds = [];
      const newPreviewUrls = [];

      for (const file of filesToProcess) {
        // Store original image in IndexedDB (no compression)
        const imageId = await storeImage(file);
        newImageIds.push(imageId);

        // Create preview URL
        const previewUrl = await getImageUrl(imageId);
        newPreviewUrls.push(previewUrl);
      }

      const updatedImageIds = [...imageIds, ...newImageIds];
      const updatedPreviewUrls = [...previewUrls, ...newPreviewUrls];

      setImageIds(updatedImageIds);
      setPreviewUrls(updatedPreviewUrls);

      // Notify parent component
      if (onImagesChange) {
        onImagesChange(updatedImageIds);
      }
    } catch (err) {
      console.error('Image upload error:', err);
      setError('Failed to upload images. Please try again.');
    }
  };

  const handleFileChange = (e) => {
    handleFileUpload(e.target.files);
  };

  const openCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      
      streamRef.current = stream;
      setIsCameraOpen(true);
      
      // Wait for next tick to ensure video element is rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Could not access camera. Please check permissions.');
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (blob) {
        closeCamera();
        
        // Store original captured image in IndexedDB
        const imageId = await storeImage(blob);
        const previewUrl = await getImageUrl(imageId);

        const updatedImageIds = [...imageIds, imageId];
        const updatedPreviewUrls = [...previewUrls, previewUrl];

        setImageIds(updatedImageIds);
        setPreviewUrls(updatedPreviewUrls);

        if (onImagesChange) {
          onImagesChange(updatedImageIds);
        }
      }
    }, 'image/jpeg', 0.9); // Higher quality for original storage
  };

  const removeImage = async (index) => {
    const imageId = imageIds[index];
    const previewUrl = previewUrls[index];

    try {
      // Revoke the preview URL to free memory
      URL.revokeObjectURL(previewUrl);
      
      // Delete from IndexedDB
      await deleteImage(imageId);

      const updatedImageIds = imageIds.filter((_, i) => i !== index);
      const updatedPreviewUrls = previewUrls.filter((_, i) => i !== index);

      setImageIds(updatedImageIds);
      setPreviewUrls(updatedPreviewUrls);

      if (onImagesChange) {
        onImagesChange(updatedImageIds);
      }
    } catch (err) {
      console.error('Remove image error:', err);
      setError('Failed to remove image. Please try again.');
    }
  };



  return (
    <Card className="p-6 bg-cream border-sage">
      <h3 className="text-lg font-semibold text-softBrown mb-4">
        Add Photos ({imageIds.length}/{maxImages})
      </h3>

      {/* Loading State */}
      {isLoading && (
        <div className="mb-4 text-center">
          <span className="inline-block w-4 h-4 border-2 border-terracotta border-t-transparent rounded-full animate-spin mr-2"></span>
          <span className="text-sm text-softBrown">Loading images...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Camera View */}
      {isCameraOpen && (
        <div className="mb-4 space-y-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg bg-black"
          />
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={capturePhoto}
              className="bg-terracotta hover:bg-terracotta/90"
            >
              📸 Capture
            </Button>
            <Button
              onClick={closeCamera}
              variant="outline"
              className="border-sage"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Upload Buttons */}
      {!isCameraOpen && imageIds.length < maxImages && (
        <div className="space-y-3 mb-4">
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-goldenrod hover:bg-goldenrod/90"
          >
            📁 Choose from Files
          </Button>
          <Button
            onClick={openCamera}
            className="w-full bg-terracotta hover:bg-terracotta/90"
          >
            📷 Take Photo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Image Previews */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {previewUrls.map((url, index) => (
            <div key={imageIds[index]} className="relative group">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border-2 border-sage/30"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
