'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { getImageUrl } from '@/lib/imageDB';

export default function EntryDetailModal({ entry, onClose }) {
  const [imageUrls, setImageUrls] = useState([]);

  // Load image URLs when entry changes
  useEffect(() => {
    if (!entry?.imageIds?.length) {
      setImageUrls([]);
      return;
    }

    async function loadImages() {
      const urls = await Promise.all(
        entry.imageIds.map(id => getImageUrl(id))
      );
      setImageUrls(urls.filter(url => url !== null));
    }

    loadImages();

    // Cleanup URLs on unmount
    return () => {
      imageUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [entry]);

  if (!entry) return null;

  // Extract paragraphs from llmResponse
  const paragraphs = entry.llmResponse?.paragraphs || [];
  const imageParagraphMapping = entry.llmResponse?.imageParagraphMapping || {};

  return (
    <Dialog open={!!entry} onOpenChange={onClose}>
      <DialogContent className="bg-warmBeige border-terracotta max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-softBrown">
            {new Date(entry.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Display paragraphs with associated images */}
          {paragraphs.map((paragraph, index) => (
            <div key={index} className="space-y-3">
              <Card className="p-6 bg-cream border-sage">
                <p className="text-lg text-softBrown leading-relaxed">
                  {paragraph}
                </p>
              </Card>

              {/* Show images mapped to this paragraph */}
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {entry.imageIds.map((imageId, imgIndex) => {
                    // Check if this image is mapped to current paragraph
                    if (imageParagraphMapping[imageId] === index && imageUrls[imgIndex]) {
                      return (
                        <img
                          key={imageId}
                          src={imageUrls[imgIndex]}
                          alt={entry.llmResponse?.imageDescriptions?.[imageId] || `Memory ${imgIndex + 1}`}
                          className="rounded-lg w-full h-48 object-cover"
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
