'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import DiaryModal from './DiaryModal';
import DiaryTopBar from './DiaryTopBar';
import AudioPlayback from './AudioPlayback';
import { getImageUrl } from '@/lib/imageDB';

export default function EntryDetailModal({ entry, onClose, onEntryDeleted }) {
  const [imageUrls, setImageUrls] = useState({});
  const [isLoadingImages, setIsLoadingImages] = useState(true);

  // Load image URLs from IndexedDB when entry changes
  useEffect(() => {
    if (!entry || !entry.imageIds || entry.imageIds.length === 0) {
      setImageUrls({});
      setIsLoadingImages(false);
      return;
    }

    let isMounted = true;
    const loadImages = async () => {
      setIsLoadingImages(true);
      const urls = {};
      
      for (const imageId of entry.imageIds) {
        try {
          const url = await getImageUrl(imageId);
          if (url && isMounted) {
            urls[imageId] = url;
          }
        } catch (error) {
          console.error(`Failed to load image ${imageId}:`, error);
        }
      }
      
      if (isMounted) {
        setImageUrls(urls);
        setIsLoadingImages(false);
      }
    };

    loadImages();

    // Cleanup: revoke blob URLs when component unmounts or entry changes
    return () => {
      isMounted = false;
      Object.values(imageUrls).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [entry]);


  if (!entry) return null;

  // Extract paragraphs from llmResponse
  const paragraphs = entry.llmResponse?.paragraphs || [];
  const imageParagraphMapping = entry.llmResponse?.imageParagraphMapping || {};
  const imageDescriptions = entry.llmResponse?.imageDescriptions || {};

  // Convert to format expected by DiaryModal: { imageId: [paragraphIndex, description, blobUrl] }
  const images = {};
  for (const imageId of entry.imageIds || []) {
    const paragraphIndex = imageParagraphMapping[imageId];
    const description = imageDescriptions[imageId] || '';
    const blobUrl = imageUrls[imageId] || null;
    
    if (blobUrl) {
      images[imageId] = [paragraphIndex, description, blobUrl];
    }
  }

  return (
    <Dialog open={!!entry} onOpenChange={onClose}>
      <DialogContent 
        className="bg-[#FFF8E7] border-2 border-[#E07A5F] max-w-4xl max-h-[85vh] p-0 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        showCloseButton={false}
      >
        {/* Hidden title for accessibility */}
        <DialogTitle className="sr-only">
          Diary Entry from {new Date(entry.date).toLocaleDateString()}
        </DialogTitle>

        {/* Fixed Topbar */}
        <DiaryTopBar date={entry.date} onClose={onClose} />

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-6 pt-6 pb-12">
          {/* Audio Playback - outside sticky bar */}
          {entry.audioBlob && (
            <div className="mb-6">
              <AudioPlayback audioBlob={entry.audioBlob} />
            </div>
          )}

          {isLoadingImages ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-terracotta/20 border-t-terracotta rounded-full animate-spin" />
            </div>
          ) : (
            <DiaryModal paragraphs={paragraphs} images={images} onDelete={() => handleDelete(entry.id, onEntryDeleted)} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

async function handleDelete(entryId, onEntryDeleted) {
  const confirmed = window.confirm('Are you sure you want to delete this diary entry? This action cannot be undone.');
  
  if (!confirmed) return;
  
  try {
    // Import the delete function
    const { deleteDiaryEntry } = await import('@/lib/storage');
    const { deleteImage, getImagesByEntryId } = await import('@/lib/imageDB');
    
    // Get all images associated with this entry
    const images = await getImagesByEntryId(entryId);
    
    // Delete all associated images
    await Promise.all(images.map(img => deleteImage(img.id)));
    
    // Delete the diary entry
    await deleteDiaryEntry(entryId);
    
    // Call the callback to refresh entries and close modal
    if (onEntryDeleted) {
      onEntryDeleted();
    }
  } catch (error) {
    console.error('Error deleting entry:', error);
    alert('Failed to delete entry. Please try again.');
  }
}
