'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';

export default function EntryDetailModal({ entry, onClose }) {
  if (!entry) return null;

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
          {/* Images */}
          {entry.images?.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {entry.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Memory ${i + 1}`}
                  className="rounded-lg w-full h-48 object-cover"
                />
              ))}
            </div>
          )}

          {/* AI Generated Text */}
          <Card className="p-6 bg-cream border-sage">
            <p className="text-lg text-softBrown leading-relaxed">
              {entry.aiGeneratedText}
            </p>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
