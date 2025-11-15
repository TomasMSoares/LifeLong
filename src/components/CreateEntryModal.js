'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import VoiceRecorder from '@/components/VoiceRecorder';
import ImageUpload from '@/components/ImageUpload';

export default function CreateEntryModal({ open, onClose, onSubmit }) {
  const [voiceText, setVoiceText] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await onSubmit(voiceText, images);
    setLoading(false);
    // Reset
    setVoiceText('');
    setImages([]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-warmBeige border-terracotta max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-softBrown">Create a New Memory</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Voice Recorder */}
          <VoiceRecorder onTranscript={setVoiceText} />

          {/* Image Upload */}
          <ImageUpload onImagesChange={setImages} />

          {/* Preview */}
          {voiceText && (
            <div className="p-4 bg-cream rounded-lg">
              <p className="text-sm text-softBrown">{voiceText}</p>
            </div>
          )}

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!voiceText || loading}
            className="w-full bg-terracotta hover:bg-terracotta/90"
          >
            {loading ? 'Generating...' : 'Create Memory'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
