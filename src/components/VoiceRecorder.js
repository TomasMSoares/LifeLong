'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { startRecording, stopRecording } from '@/lib/voiceRecorder';

export default function VoiceRecorder({ onAudioRecorded }) {
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggleRecording = async () => {
    if (!isRecording) {
      await startRecording();
      setIsRecording(true);
    } else {
      setLoading(true);
      setIsRecording(false);
      const audioBlob = await stopRecording();
      setLoading(false);

      if (audioBlob) {
        onAudioRecorded(audioBlob);
      }
    }
  };

  return (
    <Card className="p-6 bg-cream border-sage">
      <h3 className="text-lg font-semibold text-softBrown mb-4">Tell us about your day</h3>

      <Button
        onClick={handleToggleRecording}
        variant={isRecording ? "destructive" : "default"}
        className="w-full"
        disabled={loading}
      >
        {isRecording ? '⏹ Stop Recording' : loading ? '⏳ Processing...' : '🎤 Start Recording'}
      </Button>

      {isRecording && (
        <div className="mt-4 text-center">
          <span className="inline-block w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></span>
          <span className="text-sm text-softBrown">Recording...</span>
        </div>
      )}
    </Card>
  );
}
