'use client';

import { useEffect, useRef } from 'react';
import { initRoadCanvas } from '@/lib/roadRenderer';

export default function RoadCanvas({ entries, onEntryClick }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      // Initialize PixiJS canvas
      const cleanup = initRoadCanvas(canvasRef.current, entries, onEntryClick);
      return cleanup;
    }
  }, [entries, onEntryClick]);

  return (
    <div ref={canvasRef} className="w-full h-full" />
  );
}
