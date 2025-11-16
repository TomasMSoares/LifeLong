'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Compact audio playback for diary entries
 * Just play button and progress bar without extra chrome
 */
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

  if (!audioBlob) return null;

  return (
    <div className="bg-[#FFF8E7] border border-[#E07A5F]/20 rounded-lg p-3">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        className="hidden"
      />

      <div className="flex items-center gap-3">
        <Button
          onClick={handlePlayPause}
          size="sm"
          className="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white h-8 px-4"
          disabled={!audioBlob}
        >
          {isPlaying ? '⏸' : '▶'}
        </Button>

        {duration > 0 && (
          <div className="flex items-center gap-2 flex-1 text-xs text-[#8B7355]">
            <span className="min-w-[35px]">{formatTime(currentTime)}</span>
            <div className="flex-1 bg-[#E07A5F]/20 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-[#E07A5F] h-full transition-all duration-100"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <span className="min-w-[35px]">{formatTime(duration)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
