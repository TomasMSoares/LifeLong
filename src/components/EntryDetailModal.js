'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import DiaryModal from './DiaryModal';

export default function EntryDetailModal({ entry, onClose }) {

  const paragraphs = ["This is a sample paragraph for the diary entry. It contains some text to illustrate how the diary modal will display content.", "Here is another paragraph that adds more detail to the diary entry. The user can read through these paragraphs to relive their memories.", "Finally, this is the last sample paragraph. It wraps up the diary entry and provides a conclusion to the user's experience."];
  const images = {"image1.jpg": "0", "image2.jpg": "1", "image3.jpg": "2"};



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
