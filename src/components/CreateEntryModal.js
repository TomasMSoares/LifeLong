'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { startRecording, stopRecording } from '@/lib/voiceRecorder';
import { transcribeWithElevenLabs } from '@/lib/transcription';
import ImageUpload from '@/components/ImageUpload';

const STEPS = {
  VOICE: 'voice',
  IMAGES: 'images',
  LOADING: 'loading',
  PREVIEW: 'preview'
};

export default function CreateEntryModal({ open, onClose, onSubmit }) {
  const [step, setStep] = useState(STEPS.VOICE);

  // EntryData State
  const [transcript, setTranscript] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [imageIds, setImageIds] = useState([]);

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [generatedEntry, setGeneratedEntry] = useState(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep(STEPS.VOICE);
        setTranscript('');
        setAudioBlob(null);
        setImageIds([]);
        setIsRecording(false);
        setIsTranscribing(false);
        setGeneratedEntry(null);
      }, 300); // Wait for modal close animation
    }
  }, [open]);

  // Step 1: Voice Recording
  const handleToggleRecording = async () => {
    if (!isRecording) {
      await startRecording();
      setIsRecording(true);
    } else {
      setIsRecording(false);
      setIsTranscribing(true);
      const audioBlob = await stopRecording();

      try {
        if (audioBlob) {
          const { transcript } = await transcribeWithElevenLabs(audioBlob, { languageCode: 'en' });
          setTranscript(transcript);
          setAudioBlob(audioBlob);
        }
      } catch (err) {
        console.error('Transcription error:', err);
        alert('Sorry, something went wrong while processing your recording.');
      } finally {
        setIsTranscribing(false);
      }
    }
  };

  const handleVoiceNext = () => {
    if (transcript) {
      setStep(STEPS.IMAGES);
    }
  };

  // Step 2: Image Upload
  const handleImagesNext = () => {
    setStep(STEPS.LOADING);
    generateEntry();
  };

  const handleSkipImages = () => {
    setStep(STEPS.LOADING);
    generateEntry();
  };

  // Step 3: Generate Entry
  const generateEntry = async () => {
    try {
      await onSubmit(audioBlob, transcript, imageIds);
      setStep(STEPS.PREVIEW);
      // Close modal and parent will open the detail view
      setTimeout(() => {
        onClose();
      }, 1500); // Short delay to show success message
    } catch (err) {
      console.error('Generate entry error:', err);
      alert('Failed to create memory. Please try again.');
      setStep(STEPS.IMAGES);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-warmBeige border-terracotta max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-softBrown">
            {step === STEPS.VOICE && 'Tell us about your day'}
            {step === STEPS.IMAGES && 'Add some photos'}
            {step === STEPS.LOADING && 'Creating your memory...'}
            {step === STEPS.PREVIEW && 'Memory Created!'}
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {/* STEP 1: VOICE RECORDING */}
          {step === STEPS.VOICE && (
            <div className="space-y-6 animate-slide-in-right">
              {/* Animated Microphone */}
              <div className="flex flex-col items-center justify-center py-8">
                <div className="relative">
                  {/* Propagating ripples when recording */}
                  {isRecording && (
                    <>
                      <div
                        className="absolute inset-0 w-32 h-32 rounded-full border-4 border-terracotta pointer-events-none"
                        style={{ animation: 'ripple-1 1.5s ease-out infinite' }}
                      />
                      <div
                        className="absolute inset-0 w-32 h-32 rounded-full border-4 border-terracotta pointer-events-none"
                        style={{ animation: 'ripple-2 1.5s ease-out infinite 0.3s' }}
                      />
                      <div
                        className="absolute inset-0 w-32 h-32 rounded-full border-4 border-terracotta pointer-events-none"
                        style={{ animation: 'ripple-3 1.5s ease-out infinite 0.6s' }}
                      />
                    </>
                  )}

                  <button
                    onClick={handleToggleRecording}
                    disabled={isTranscribing}
                    className="relative w-32 h-32 rounded-full bg-terracotta hover:bg-terracotta/90 flex items-center justify-center transition-all"
                  >
                    {isTranscribing ? (
                      <div className="relative w-20 h-20">
                        <Image
                          src="/hourglass-2-svgrepo-com.svg"
                          alt="Processing"
                          width={80}
                          height={80}
                          className="object-contain animate-loading-spinner"
                        />
                      </div>
                    ) : (
                      <div className={`relative w-20 h-20 ${isRecording ? 'animate-microphone-pulse' : ''}`}>
                        <Image
                          src="/microphone-svgrepo-com.svg"
                          alt="Microphone"
                          width={80}
                          height={80}
                          className="object-contain"
                        />
                      </div>
                    )}
                  </button>
                </div>

                <p className="mt-6 text-lg text-softBrown text-center">
                  {isTranscribing
                    ? 'Processing your recording...'
                    : isRecording
                    ? 'Tap to stop recording'
                    : 'Tap to start recording'}
                </p>
              </div>

              {/* Transcript Preview */}
              {transcript && (
                <div className="p-6 bg-cream rounded-lg border-2 border-sage/30 animate-fade-in">
                  <h4 className="text-sm font-semibold text-softBrown mb-2">Your story:</h4>
                  <p className="text-base text-softBrown leading-relaxed">{transcript}</p>
                </div>
              )}

              {/* Next Button */}
              <div className="flex gap-3">
                {transcript && (
                  <Button
                    onClick={handleVoiceNext}
                    className="flex-1 bg-terracotta hover:bg-terracotta/90 text-lg py-6"
                  >
                    Next: Add Photos →
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: IMAGE UPLOAD */}
          {step === STEPS.IMAGES && (
            <div className="space-y-6 animate-slide-in-right">
              <ImageUpload onImagesChange={setImageIds} />

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(STEPS.VOICE)}
                  variant="outline"
                  className="flex-1 border-sage text-softBrown"
                >
                  ← Back
                </Button>
                <Button
                  onClick={handleSkipImages}
                  variant="outline"
                  className="flex-1 border-terracotta text-terracotta"
                >
                  Skip Photos
                </Button>
                <Button
                  onClick={handleImagesNext}
                  className="flex-1 bg-terracotta hover:bg-terracotta/90"
                >
                  Create Memory →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: LOADING */}
          {step === STEPS.LOADING && (
            <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
              {/* Simple circular loading animation */}
              <div className="relative w-32 h-32 mb-8">
                <div className="absolute inset-0 rounded-full border-8 border-terracotta/20" />
                <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-terracotta animate-loading-spinner" />
              </div>

              <p className="text-xl text-softBrown font-semibold mb-2">Crafting your memory...</p>
              <p className="text-sm text-softBrown/70">Weaving your story together</p>
            </div>
          )}

          {/* STEP 4: SUCCESS PREVIEW */}
          {step === STEPS.PREVIEW && (
            <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
              <div className="w-32 h-32 rounded-full bg-gradient-radial from-terracotta to-goldenrod flex items-center justify-center text-6xl mb-6 animate-glow">
                ✓
              </div>
              <h3 className="text-2xl font-bold text-softBrown mb-2">Memory Created!</h3>
              <p className="text-softBrown/70">Your memory has been added to your timeline</p>
            </div>
          )}
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center gap-2 pb-4">
          <div className={`w-2 h-2 rounded-full transition-all ${step === STEPS.VOICE ? 'bg-terracotta w-8' : 'bg-terracotta/30'}`} />
          <div className={`w-2 h-2 rounded-full transition-all ${step === STEPS.IMAGES ? 'bg-terracotta w-8' : 'bg-terracotta/30'}`} />
          <div className={`w-2 h-2 rounded-full transition-all ${step === STEPS.LOADING || step === STEPS.PREVIEW ? 'bg-terracotta w-8' : 'bg-terracotta/30'}`} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
