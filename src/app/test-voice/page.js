'use client';

import { useState, useEffect } from 'react';
import VoiceRecorder from '@/components/VoiceRecorder';
import AudioPlayback from '@/components/AudioPlayback';
import ImageUpload from '@/components/ImageUpload';
import { Card } from '@/components/ui/card';
import { getImagesAsBase64, updateImageParagraph, getImageUrl } from '@/lib/imageDB';
import { generateDiaryEntry } from '@/lib/gemini';

const TEST_STORAGE_KEY = 'test-voice-image-ids';

export default function TestVoicePage() {
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [paragraphs, setParagraphs] = useState([]);
  const [imageIds, setImageIds] = useState([]);
  const [imageParagraphMapping, setImageParagraphMapping] = useState({});
  const [rawJsonResponse, setRawJsonResponse] = useState(null);
  const [imageUrls, setImageUrls] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('Margaret');

  // Load image IDs from localStorage on mount
  useEffect(() => {
    const savedIds = localStorage.getItem(TEST_STORAGE_KEY);
    if (savedIds) {
      try {
        const parsed = JSON.parse(savedIds);
        setImageIds(Array.isArray(parsed) ? parsed : []);
      } catch (err) {
        console.error('Failed to parse saved image IDs:', err);
      }
    }
  }, []);

  const handleAudioRecorded = (blob) => {
    setAudioBlob(blob);
    setError('');
  };

  const handleImagesChange = async (newImageIds) => {
    setImageIds(newImageIds);
    // Persist to localStorage for test page persistence
    localStorage.setItem(TEST_STORAGE_KEY, JSON.stringify(newImageIds));
    console.log('Images updated:', newImageIds);
    
    // Load image URLs for display
    const urls = {};
    for (const id of newImageIds) {
      const url = await getImageUrl(id);
      if (url) urls[id] = url;
    }
    setImageUrls(urls);
  };
  
  // Load image URLs on mount
  useEffect(() => {
    const loadImageUrls = async () => {
      const urls = {};
      for (const id of imageIds) {
        const url = await getImageUrl(id);
        if (url) urls[id] = url;
      }
      setImageUrls(urls);
    };
    
    if (imageIds.length > 0) {
      loadImageUrls();
    }
    
    // Cleanup URLs on unmount
    return () => {
      Object.values(imageUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageIds]);

  const handleTranscript = async (rawTranscript) => {
    setTranscript(rawTranscript);
    setError('');
    
    // Generate diary entry with image mapping
    setLoading(true);
    try {
      // Get base64 images for LLM
      const imageData = await getImagesAsBase64(imageIds);
      
      // Call generate-entry API with transcript, userName, and images
      const result = await generateDiaryEntry(rawTranscript, userName, imageData);
      
      setParagraphs(result.paragraphs);
      setImageParagraphMapping(result.imageParagraphMapping);
      setRawJsonResponse(result);
      
      // Update IndexedDB with paragraph associations
      for (const [imageId, paragraphIndex] of Object.entries(result.imageParagraphMapping)) {
        await updateImageParagraph(imageId, paragraphIndex);
      }
      
      console.log('Generated paragraphs:', result.paragraphs);
      console.log('Image mapping:', result.imageParagraphMapping);
    } catch (err) {
      console.error('Entry generation error:', err);
      setError('Failed to process transcript and images. Please try again.');
      setParagraphs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warmBeige p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-softBrown text-center mb-8">
          Voice Recording Test
        </h1>

        {/* User Name Input */}
        <Card className="p-6 bg-cream border-sage">
          <label className="block text-lg font-semibold text-softBrown mb-2">
            Your Name (for third-person narration)
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-4 py-3 text-lg rounded-lg border-2 border-sage/30 focus:border-terracotta focus:outline-none bg-warmBeige text-softBrown"
            placeholder="Enter your name..."
          />
          <p className="text-sm text-sage mt-2">
            The AI will write about your day using your name in third person
          </p>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Voice Recorder */}
          <VoiceRecorder 
            onAudioRecorded={handleAudioRecorded}
            onTranscript={handleTranscript}
          />

          {/* Audio Playback */}
          <AudioPlayback audioBlob={audioBlob} />
        </div>

        {/* Image Upload */}
        <ImageUpload 
          onImagesChange={handleImagesChange} 
          maxImages={6}
          initialImageIds={imageIds}
        />

        {/* Error Display */}
        {error && (
          <Card className="p-6 bg-red-50 border-red-300">
            <p className="text-red-700 text-lg">⚠️ {error}</p>
          </Card>
        )}

        {/* Raw Transcript Display */}
        {transcript && (
          <Card className="p-6 bg-cream border-sage">
            <h3 className="text-lg font-semibold text-softBrown mb-4">
              Raw Transcript
            </h3>
            <p className="text-softBrown whitespace-pre-wrap">{transcript}</p>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="p-6 bg-cream border-sage">
            <div className="text-center">
              <span className="inline-block w-4 h-4 border-2 border-terracotta border-t-transparent rounded-full animate-spin mr-2"></span>
              <span className="text-lg text-softBrown">Processing transcript...</span>
            </div>
          </Card>
        )}

        {/* Cleaned Paragraphs Display */}
        {paragraphs.length > 0 && (
          <Card className="p-6 bg-cream border-sage">
            <h3 className="text-lg font-semibold text-softBrown mb-4">
              Cleaned Paragraphs ({paragraphs.length})
            </h3>
            <div className="space-y-4">
              {paragraphs.map((paragraph, index) => (
                <div 
                  key={index}
                  className="p-4 bg-warmBeige rounded-lg border border-sage/30"
                >
                  <span className="text-xs text-sage font-semibold mb-2 block">
                    Paragraph {index}
                  </span>
                  <p className="text-softBrown leading-relaxed">
                    {paragraph}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Raw JSON Response from LLM */}
        {rawJsonResponse && (
          <Card className="p-6 bg-cream border-sage">
            <h3 className="text-lg font-semibold text-softBrown mb-4">
              🔍 Raw JSON Response from LLM
            </h3>
            <pre className="bg-warmBeige p-4 rounded-lg overflow-x-auto text-xs font-mono text-softBrown border border-sage/30">
              {JSON.stringify(rawJsonResponse, null, 2)}
            </pre>
          </Card>
        )}

        {/* Image-to-Paragraph Mapping Display */}
        {Object.keys(imageParagraphMapping).length > 0 && (
          <Card className="p-6 bg-cream border-sage">
            <h3 className="text-lg font-semibold text-softBrown mb-4">
              🖼️ Image-to-Paragraph Mapping (LLM Decision)
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(imageParagraphMapping).map(([imageId, paragraphIndex]) => (
                <div key={imageId} className="bg-warmBeige p-3 rounded-lg border border-sage/30">
                  {imageUrls[imageId] && (
                    <img 
                      src={imageUrls[imageId]} 
                      alt={`Image ${imageId}`}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <div className="text-xs text-sage font-semibold mb-1">Image ID</div>
                  <div className="text-sm text-softBrown font-mono mb-2">{imageId}</div>
                  <div className="text-xs text-sage font-semibold mb-1">Appears after paragraph</div>
                  <div className="text-lg font-bold text-terracotta">{paragraphIndex}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-sage mt-4">
              ✨ The LLM analyzed the images and transcript to create these associations
            </p>
          </Card>
        )}

        {/* Image IDs Display */}
        {imageIds.length > 0 && (
          <Card className="p-6 bg-cream border-sage">
            <h3 className="text-lg font-semibold text-softBrown mb-4">
              Uploaded Images ({imageIds.length})
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {imageIds.map((id, index) => {
                const mappedParagraph = imageParagraphMapping[id];
                return (
                  <div key={id} className="bg-warmBeige p-3 rounded-lg border border-sage/30">
                    {imageUrls[id] && (
                      <img 
                        src={imageUrls[id]} 
                        alt={`Image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                    )}
                    <div className="text-xs text-sage font-semibold mb-1">#{index + 1}</div>
                    <div className="text-xs text-softBrown font-mono break-all">{id}</div>
                    {mappedParagraph !== undefined && (
                      <div className="mt-2">
                        <span className="text-xs bg-terracotta text-white px-2 py-1 rounded">
                          → Para {mappedParagraph}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Instructions */}
        <Card className="p-6 bg-goldenrod/10 border-goldenrod">
          <h3 className="text-lg font-semibold text-softBrown mb-2">
            How to Test
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-softBrown">
            <li>Enter your name for third-person narration</li>
            <li>Click "Start Recording" and speak about your day</li>
            <li>Click "Stop Recording" when done</li>
            <li>Upload photos or take pictures with your camera</li>
            <li>Use the playback button to hear your recording</li>
            <li>Review the paragraphs and see how the LLM mapped images to paragraphs!</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
