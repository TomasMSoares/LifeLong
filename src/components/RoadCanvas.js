'use client';

import { useState, useRef, useCallback, useEffect, useMemo, memo } from 'react';
import Image from 'next/image';

const NODE_SPACING = 220;
const NODE_RADIUS = 70;
const MIN_SCALE = 0.5;
const MAX_SCALE = 1.0;

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
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = useCallback(() => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
    if (onClick) onClick();
  }, [onClick]);

  return (
    <div className="relative flex items-center justify-center py-5">
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex items-center justify-center transition-transform hover:scale-110 touch-manipulation"
      >
        {/* Click ripple effect */}
        {isClicked && (
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full border-4 border-terracotta"
              style={{ animation: 'click-ripple 0.6s ease-out' }}
            />
          </div>
        )}

        {/* Main circle with enhanced glow */}
        <div
          className={`relative bg-white rounded-full border-8 flex items-center justify-center animate-add-memory-glow ${isClicked ? 'animate-click-burst' : ''} ${isHovered ? 'border-goldenrod' : 'border-terracotta'}`}
          style={{
            width: `${NODE_RADIUS * 2.8}px`,
            height: `${NODE_RADIUS * 2.8}px`,
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 1), rgba(255, 248, 231, 0.98) 50%, rgba(224, 122, 95, 0.15))'
          }}
        >
          {/* Curved "ADD MEMORY" text */}
          <CurvedText
            text="ADD MEMORY"
            radius={NODE_RADIUS * 1.6}
            fontSize={14}
            className="text-terracotta font-bold"
          />

          {/* Heart icon */}
          <div className="relative w-16 h-16 z-10">
            <Image
              src="/heart-svgrepo-com.svg"
              alt="Add Memory"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>

          {/* Plus button overlay with pulse */}
          <div className="absolute -right-3 bottom-2 w-12 h-12 bg-terracotta rounded-full flex items-center justify-center shadow-lg z-50">
            <span className="text-white text-3xl font-bold leading-none pb-0.5">+</span>
          </div>

          {/* Inner shimmer */}
          <div
            className="absolute inset-0 overflow-hidden rounded-full pointer-events-none"
            style={{ opacity: 0.3 }}
          >
            <div
              className="absolute inset-0 animate-shimmer"
              style={{
                width: '50%',
                height: '200%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.9), transparent)',
                left: '-50%',
                animationDelay: '1s',
              }}
            />
          </div>
        </div>
      </button>
    </div>
  );
});

// Regular entry node with glowing memory orb - Memoized
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

  const hasImage = entry.images && entry.images.length > 0;

  return (
    <div className="relative flex items-center justify-center pt-8 pb-5">
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex items-center justify-center transition-transform hover:scale-110 touch-manipulation"
      >
        {/* Glowing memory orb */}
        <div
          className={`relative rounded-full border-6 flex items-center justify-center transition-all float ${isHovered ? 'border-goldenrod' : 'border-terracotta'}`}
          style={{
            width: `${NODE_RADIUS * 2}px`,
            height: `${NODE_RADIUS * 2}px`,
            background: hasImage
              ? 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), rgba(255, 248, 231, 0.95) 50%, rgba(224, 122, 95, 0.3))'
              : 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(255, 248, 231, 0.9) 50%, rgba(224, 122, 95, 0.4))',
          }}
        >
          {/* Image inside orb (if exists) */}
          {hasImage ? (
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <img
                src={entry.images[0]}
                alt="Memory"
                className="w-full h-full object-cover opacity-85"
                style={{
                  mixBlendMode: 'multiply',
                }}
              />
              {/* Color overlay for glow effect */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, rgba(255, 248, 231, 0.4), transparent 70%)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          ) : (
            /* Fallback: Diary icon with glow */
            <div className="relative w-16 h-16 z-10">
              <Image
                src="/page.svg"
                alt="Memory"
                width={64}
                height={64}
                className="object-contain opacity-70"
              />
            </div>
          )}

          {/* Curved date text */}
          <div className="absolute inset-0 z-20">
            <CurvedText
              text={dateText}
              radius={NODE_RADIUS * 1.2}
              fontSize={14}
              className="text-terracotta font-bold drop-shadow-md"
            />
          </div>

          {/* Sphere highlight effect */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              top: '10%',
              left: '15%',
              width: '40%',
              height: '40%',
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6), transparent 70%)',
            }}
          />

          {/* Shimmer sweep effect */}
          <div
            className="absolute inset-0 overflow-hidden rounded-full pointer-events-none"
            style={{ opacity: 0.4 }}
          >
            <div
              className="absolute inset-0 animate-shimmer"
              style={{
                width: '50%',
                height: '200%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
                left: '-50%',
              }}
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
        <div key={i} className="w-3 h-3 bg-terracotta rounded-full" />
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
  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(MAX_SCALE, prev + 0.5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(MIN_SCALE, prev - 0.5));
  }, []);

  // Auto-scroll to top on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-cream">
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
          className="relative min-h-full flex flex-col items-center px-6 pt-50 transition-transform duration-200"
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

      {/* Zoom control button */}
      <div className="fixed bottom-10 right-10">
        {scale < MAX_SCALE ? (
          /* Zoom In button */
          <button
            onClick={handleZoomIn}
            className="w-14 h-14 bg-terracotta hover:bg-softBrown text-white font-bold rounded-full shadow-lg transition-all duration-200 flex items-center justify-center touch-manipulation"
            aria-label="Zoom in"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" strokeWidth="2"/>
              <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
              <path d="M11 8v6M8 11h6" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        ) : (
          /* Zoom Out button */
          <button
            onClick={handleZoomOut}
            className="w-14 h-14 bg-terracotta hover:bg-softBrown text-white font-bold rounded-full shadow-lg transition-all duration-200 flex items-center justify-center touch-manipulation"
            aria-label="Zoom out"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" strokeWidth="2"/>
              <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
              <path d="M8 11h6" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
