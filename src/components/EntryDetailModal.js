'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import DiaryModal from './DiaryModal';

/**
 * Combine two mocked maps into { filename: [paragraphIdx, description] }
 * Accepts plain objects or Maps.
 */
function combineImageMeta(imagesToParagraphs = {}, imagesToDescription = {}) {
  const result = {};
  const keys = new Set();

  if (imagesToParagraphs instanceof Map) {
    for (const k of imagesToParagraphs.keys()) keys.add(k);
  } else {
    for (const k of Object.keys(imagesToParagraphs)) keys.add(k);
  }

  if (imagesToDescription instanceof Map) {
    for (const k of imagesToDescription.keys()) keys.add(k);
  } else {
    for (const k of Object.keys(imagesToDescription)) keys.add(k);
  }

  for (const k of keys) {
    const idx = imagesToParagraphs instanceof Map ? imagesToParagraphs.get(k) : imagesToParagraphs[k];
    const desc = imagesToDescription instanceof Map ? imagesToDescription.get(k) : imagesToDescription[k];
    result[k] = [typeof idx === 'number' ? idx : null, typeof desc === 'string' ? desc : ''];
  }

  return result;
}

export default function EntryDetailModal({ entry, onClose }) {

  const paragraphs = ["This is a sample paragraph for the diary entry. It contains some text to illustrate how the diary modal will display content.", "Here is another paragraph that adds more detail to the diary entry. The user can read through these paragraphs to relive their memories.", "Finally, this is the last sample paragraph. It wraps up the diary entry and provides a conclusion to the user's experience."];
  const images_to_paragraphs = {
    "image1.jpg": 0,
    "image2.jpg": 1,
    "image3.jpg": 2,
    "image4.jpg": 0,
  };

  const images_to_description = {
    "image1.jpg": "A beautiful sunrise over the mountains.",
    "image2.jpg": "A delicious meal I had at a local restaurant.",
    "image3.jpg": "My pet playing in the garden.",
    "image4.jpg": "A memorable trip to the beach with friends.",
  };

  // merge the two mocked structures into the format expected by DiaryModal
  const images = combineImageMeta(images_to_paragraphs, images_to_description);
  

  if (!entry) return null;

  return (
    <Dialog open={!!entry} onOpenChange={onClose}>
      <DialogContent className="bg-warmBeige border-terracotta max-w-3xl sm:mr-4 sm:ml-4 overflow-y-auto h-[80vh]">
             <DialogHeader>
            <DialogTitle></DialogTitle>
            <DiaryModal paragraphs={paragraphs} images={images} />
          </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
