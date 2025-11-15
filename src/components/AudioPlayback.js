'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function AudioPlayback({ audioBlob }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);

  useEffect(() => {
    if (!audioBlob) return;

    // Create object URL for the audio blob
    audioUrlRef.current = URL.createObjectURL(audioBlob);
    
    if (audioRef.current) {
      audioRef.current.src = audioUrlRef.current;
      audioRef.current.load();
    }

    // Cleanup on unmount
    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, [audioBlob]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!audioBlob) {
    return (
      <Card className="p-6 bg-cream border-sage">
        <p className="text-softBrown text-center">No audio recorded yet</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-cream border-sage">
      <h3 className="text-lg font-semibold text-softBrown mb-4">Your Recording</h3>
      
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        className="hidden"
      />

      <div className="space-y-4">
        <Button
          onClick={handlePlayPause}
          className="w-full bg-terracotta hover:bg-terracotta/90 text-white"
          disabled={!audioBlob}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </Button>

        {duration > 0 && (
          <div className="flex items-center justify-between text-sm text-softBrown">
            <span>{formatTime(currentTime)}</span>
            <div className="flex-1 mx-4 bg-sage/20 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-terracotta h-full transition-all duration-100"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
