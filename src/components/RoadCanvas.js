'use client';

import { useState, useRef, useCallback, useEffect, useMemo, memo } from 'react';
import Image from 'next/image';

const NODE_SPACING = 220;
const NODE_RADIUS = 70;
const MIN_SCALE = 0.5;
const MAX_SCALE = 1.5;

// Curved text component
function CurvedText({ text, radius, fontSize = 16, className = '' }) {
  const chars = text.split('');
  // Reduce the arc span to bring characters closer together
  const totalArc = 120; // degrees (was 180, now smaller = tighter spacing)
  const angleStep = totalArc / (chars.length - 1);
  const startAngle = -90 - (totalArc / 2); // Center the arc at top

  return (
    <div className="absolute inset-0 pointer-events-none">
      {chars.map((char, i) => {
        const angle = startAngle + (i * angleStep);
        const x = Math.round(radius * Math.cos((angle * Math.PI) / 180));
        const y = Math.round(radius * Math.sin((angle * Math.PI) / 180));

        return (
          <span
            key={i}
            className={`absolute font-bold ${className}`}
            style={{
              fontSize: `${fontSize}px`,
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${angle + 90}deg)`,
            }}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
}

// Add Memory node (top node with heart and + button) - Memoized
const AddMemoryNode = memo(function AddMemoryNode({ onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative flex items-center justify-center py-5">
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex items-center justify-center transition-transform hover:scale-105 touch-manipulation"
      >
        {/* Main circle */}
        <div className={`relative bg-white rounded-full border-8 border-blue-500 shadow-lg flex items-center justify-center ${isHovered ? 'border-blue-600' : 'border-blue-500'}`}
          style={{ width: `${NODE_RADIUS * 2.8}px`, height: `${NODE_RADIUS * 2.8}px` }}
        >
          {/* Curved "ADD MEMORY" text */}
          <CurvedText
            text="ADD MEMORY"
            radius={NODE_RADIUS * 1.6}
            fontSize={14}
            className="text-blue-500"
          />

          {/* Heart icon */}
          <div className="relative w-16 h-16">
            <Image
              src="/heart-svgrepo-com.svg"
              alt="Add Memory"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
        </div>
      </button>
    </div>
  );
});

// Regular entry node with diary icon and date - Memoized
const EntryNode = memo(function EntryNode({ entry, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  const dateText = useMemo(() => {
    const date = new Date(entry.date);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '/');
  }, [entry.date]);

  const handleClick = useCallback(() => {
    if (onClick) onClick(entry);
  }, [onClick, entry]);

  return (
    <div className="relative flex items-center justify-center py-5">
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex items-center justify-center transition-transform hover:scale-105 touch-manipulation"
      >
        {/* Main circle */}
        <div
          className={`relative bg-white rounded-full border-8 shadow-lg flex items-center justify-center transition-all ${
            isHovered ? 'border-blue-600' : 'border-blue-500'
          }`}
          style={{ width: `${NODE_RADIUS * 2}px`, height: `${NODE_RADIUS * 2}px` }}
        >
          {/* Curved date text */}
          <CurvedText
            text={dateText}
            radius={NODE_RADIUS * 1.2}
            fontSize={14}
            className="text-blue-500"
          />

          {/* Diary icon */}
          <div className="relative w-16 h-16">
            <Image
              src="/diary-svgrepo-com.svg"
              alt="Memory"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
        </div>
      </button>
    </div>
  );
});

// Dotted connecting line
function DottedLine({ isAddMemory }) {
  const dots = isAddMemory ? 5 : 3;

  return (
    <div className="flex flex-col items-center gap-2">
      {[...Array(dots)].map((_, i) => (
        <div key={i} className="w-3 h-3 bg-blue-500 rounded-full" />
      ))}
    </div>
  );
}

export default function RoadCanvas({ entries, onEntryClick }) {
  const [scale, setScale] = useState(1.0);
  const scrollContainerRef = useRef(null);
  const timelineRef = useRef(null);
  const lastDistanceRef = useRef(0);

  // Memoize positions to prevent recalculation
  const positions = useMemo(() => [
    { entry: null, isCurrent: true },
    ...entries.map((entry) => ({ entry, isCurrent: false }))
  ], [entries]);

  // Handle pinch zoom
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const distance = Math.round(Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY
      ));
      lastDistanceRef.current = distance;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2) {
      e.preventDefault();

      const distance = Math.round(Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY
      ));

      if (lastDistanceRef.current > 0) {
        const delta = (distance - lastDistanceRef.current) * 0.01;
        setScale((prev) => Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev + delta)));
      }

      lastDistanceRef.current = distance;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    lastDistanceRef.current = 0;
  }, []);

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.01;
      setScale((prev) => Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev + delta)));
    }
  }, []);

  // Reset/toggle zoom
  const handleResetZoom = useCallback(() => {
    setScale((prev) => prev === 1.0 ? MIN_SCALE : 1.0);
  }, []);

  // Auto-scroll to top on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#F5E6D3]">
      {/* Scrollable container with momentum */}
      <div
        ref={scrollContainerRef}
        className="w-full h-full overflow-y-scroll overflow-x-hidden"
        style={{
          WebkitOverflowScrolling: 'touch', // iOS momentum scrolling
          scrollBehavior: 'smooth',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {/* Scalable timeline wrapper */}
        <div
          ref={timelineRef}
          className="relative min-h-full flex flex-col items-center px-6 py-12 transition-transform duration-200"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
        >
          {/* Timeline nodes */}
          <div className="relative flex flex-col items-center w-full max-w-md">
            {positions.map((pos, i) => (
              <div
                key={pos.entry?.id || 'current'}
                className="relative w-full flex flex-col items-center"
              >
                {pos.isCurrent ? (
                  <AddMemoryNode onClick={() => onEntryClick && onEntryClick(null)} />
                ) : (
                  <EntryNode entry={pos.entry} onClick={onEntryClick} />
                )}

                {/* Dotted line connecting to next node */}
                {i < positions.length - 1 && <DottedLine isAddMemory={pos.isCurrent} />}
              </div>
            ))}

            {/* Bottom padding for comfortable scrolling */}
            <div className="h-96" />
          </div>
        </div>
      </div>

      {/* Zoom control buttons */}
      {scale !== 1.0 && (
        <button
          onClick={handleResetZoom}
          className="absolute bottom-10 left-10 bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-4 rounded-full shadow-lg transition-all duration-200 text-lg touch-manipulation"
        >
          Reset Zoom
        </button>
      )}

      {scale === 1.0 && (
        <button
          onClick={handleResetZoom}
          className="absolute bottom-10 left-10 bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-4 rounded-full shadow-lg transition-all duration-200 text-lg touch-manipulation"
        >
          Zoom Out
        </button>
      )}

      {/* Zoom instructions (hidden on mobile) */}
      <div className="hidden md:block absolute top-4 right-4 bg-black/20 text-white px-3 py-1 rounded-full text-xs">
        Ctrl + Scroll to zoom
      </div>
    </div>
  );
}
