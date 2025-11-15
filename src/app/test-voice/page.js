'use client';

import { useState } from 'react';
import VoiceRecorder from '@/components/VoiceRecorder';
import AudioPlayback from '@/components/AudioPlayback';
import { Card } from '@/components/ui/card';

export default function TestVoicePage() {
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [paragraphs, setParagraphs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('Margaret');

  const handleAudioRecorded = (blob) => {
    setAudioBlob(blob);
    setError('');
  };

  const handleTranscript = async (rawTranscript) => {
    setTranscript(rawTranscript);
    setError('');
    
    // Call cleanup API to get structured paragraphs
    setLoading(true);
    try {
      const response = await fetch('/api/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          transcript: rawTranscript,
          userName: userName 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to clean up transcript');
      }

      const data = await response.json();
      setParagraphs(data.paragraphs || []);
    } catch (err) {
      console.error('Cleanup error:', err);
      setError('Failed to process transcript. Please try again.');
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
                    Paragraph {index + 1}
                  </span>
                  <p className="text-softBrown leading-relaxed">
                    {paragraph}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Instructions */}
        <Card className="p-6 bg-goldenrod/10 border-goldenrod">
          <h3 className="text-lg font-semibold text-softBrown mb-2">
            How to Test
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-softBrown">
            <li>Click "Start Recording" and speak about your day</li>
            <li>Click "Stop Recording" when done</li>
            <li>Wait for transcription to complete</li>
            <li>Use the playback button to hear your recording</li>
            <li>Review the raw transcript and cleaned paragraphs below</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
