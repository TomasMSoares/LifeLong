import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"
import { BookHeart, Sparkles, Image, Mic, ArrowRight } from 'lucide-react';


export default function InitialPage({ onSubmit, existingUser }) {
  console.log('[InitialPage] Component rendering');

  const [isFading, setIsFading] = useState(false);     // starts false
  const [hide, setHide] = useState(false);             // controls scrolling
  const [visible, setVisible] = useState(true);        // rendered initially
  const [currentUser, setCurrentUser] = useState("");

  useEffect(() => {
  if (!hide) {
    // Disable scrolling
    document.body.style.overflow = "hidden";
  } else {
    // Re-enable scrolling
    document.body.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [hide]);


  useEffect(() => {
    if (!isFading) return;

    // Remove from DOM after transition completes
    const timeout = setTimeout(() => {
      console.log('[InitialPage] Fade complete, hiding component');
      setVisible(false);
    }, 800); // Match the CSS transition duration

    return () => clearTimeout(timeout);
  }, [isFading]);

  console.log('[InitialPage] Render state - visible:', visible, 'isFading:', isFading);

  if (!visible) {
    console.log('[InitialPage] Not visible, returning null');
    return null;
  }

  return (
    <div className="fixed inset-0 z-30" style={{ height: '100vh', height: '100dvh' }}>
      <div
        className={`
          w-full h-full flex flex-col items-center justify-center overflow-hidden
          transition-all duration-700 ease-out
          ${isFading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
        `}
        style={{
          background: `linear-gradient(135deg,
            rgb(255, 248, 231) 0%,
            rgb(245, 230, 211) 50%,
            rgb(255, 243, 224) 100%)`
        }}
      >
        {/* Floating decorative elements */}
        <div className={`absolute inset-0 overflow-hidden pointer-events-none transition-all duration-700 ${isFading ? 'opacity-0 blur-sm' : 'opacity-100'}`}>
          <div className="absolute top-10 md:top-20 -left-10 md:left-10 animate-glow"
            style={{ backgroundColor: '#E07A5F', width: '120px', height: '120px', borderRadius: '50%', opacity: 0.12 }}
          />
          <div className="absolute bottom-20 md:bottom-32 -right-12 md:right-16 animate-glow-gold"
            style={{ backgroundColor: '#F4A259', width: '140px', height: '140px', borderRadius: '50%', opacity: 0.12 }}
          />
          <div className="absolute top-1/2 -right-8 md:right-20 animate-glow-sage"
            style={{ backgroundColor: '#81B29A', width: '100px', height: '100px', borderRadius: '50%', opacity: 0.1 }}
          />
        </div>

        {/* Main content card */}
        <div
          className={`
            flex flex-col items-center justify-center
            px-6 py-8 sm:px-8 sm:py-12
            mx-4 sm:mx-6
            max-w-2xl w-full relative
            transition-all duration-700 ease-out
            ${isFading ? 'opacity-0 scale-90 -translate-y-8' : 'opacity-100 scale-100 translate-y-0 animate-fade-in'}
          `}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            boxShadow: "0px 20px 60px rgba(224, 122, 95, 0.15), 0px 8px 16px rgba(0, 0, 0, 0.08)"
          }}
        >
          {/* Icon header */}
          <div className="flex items-center gap-3 mb-4 sm:mb-6 animate-float">
            <BookHeart
              size={48}
              strokeWidth={1.5}
              style={{ color: '#E07A5F' }}
              className="sm:w-14 sm:h-14"
            />
            <Sparkles
              size={24}
              strokeWidth={2}
              style={{ color: '#F4A259', position: 'absolute', marginLeft: '36px', marginTop: '-16px' }}
              className="animate-pulse sm:w-8 sm:h-8"
            />
          </div>

          {/* Title */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-serif text-center mb-3 sm:mb-4 animate-slide-in-left px-2"
            style={{
              fontFamily: "var(--font-quicksand)",
              fontWeight: 700,
              color: '#BF5846',
              letterSpacing: '-0.02em'
            }}
          >
            Welcome to LifeLong
          </h1>

          {/* Subtitle */}
          <p
            className="text-base sm:text-xl text-center mb-6 sm:mb-8 max-w-lg leading-relaxed animate-slide-in-right px-4"
            style={{
              fontFamily: "var(--font-quicksand)",
              fontWeight: 500,
              color: '#8B7355'
            }}
          >
            Your treasured moments, beautifully preserved.
            <span style={{ color: '#E07A5F', fontWeight: 600 }}> Speak</span>,
            <span style={{ color: '#F4A259', fontWeight: 600 }}> share</span>, and
            <span style={{ color: '#81B29A', fontWeight: 600 }}> relive</span> the stories of your life.
          </p>

          {/* Feature highlights */}
          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center mb-8 sm:mb-10 animate-fade-in px-2" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full" style={{ backgroundColor: '#FFF8E7' }}>
                <Mic size={18} style={{ color: '#E07A5F' }} className="sm:w-5 sm:h-5" />
              </div>
              <span style={{ fontFamily: "var(--font-quicksand)", color: '#8B7355', fontSize: '14px' }} className="sm:text-base">
                Voice Stories
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full" style={{ backgroundColor: '#FFF8E7' }}>
                <Image size={18} style={{ color: '#F4A259' }} className="sm:w-5 sm:h-5" />
              </div>
              <span style={{ fontFamily: "var(--font-quicksand)", color: '#8B7355', fontSize: '14px' }} className="sm:text-base">
                Photo Memories
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full" style={{ backgroundColor: '#FFF8E7' }}>
                <Sparkles size={18} style={{ color: '#81B29A' }} className="sm:w-5 sm:h-5" />
              </div>
              <span style={{ fontFamily: "var(--font-quicksand)", color: '#8B7355', fontSize: '14px' }} className="sm:text-base">
                AI Magic
              </span>
            </div>
          </div>

          {/* Name input or welcome message */}
          <div className="w-full max-w-md mb-6 sm:mb-8 px-2">
            {existingUser ? (
              <p
                className="text-center text-xl sm:text-2xl"
                style={{ 
                  fontFamily: "var(--font-quicksand)", 
                  fontWeight: 600, 
                  color: '#8B7355'
                }}
              >
                Your memories await you, <span style={{ color: '#E07A5F' }}>{existingUser}</span>
              </p>
            ) : (
              <>
                <label
                  className="block text-center mb-3 text-base sm:text-lg"
                  style={{ fontFamily: "var(--font-quicksand)", fontWeight: 600, color: '#8B7355' }}
                >
                  What shall we call you?
                </label>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  className="text-center text-lg sm:text-xl py-5 sm:py-6 border-2 focus:ring-4"
                  style={{
                    fontFamily: "var(--font-quicksand)",
                    borderColor: '#F5E6D3',
                    backgroundColor: '#FFFCF7'
                  }}
                  onChange={(e) => setCurrentUser(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && currentUser.trim()) {
                      setIsFading(true);
                      setHide(true);
                      onSubmit(currentUser);
                    }
                  }}
                />
              </>
            )}
          </div>

          {/* CTA Button */}
          <Button
            className="px-8 py-6 sm:px-10 sm:py-7 text-lg sm:text-xl font-semibold rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3 animate-float shadow-lg w-full sm:w-auto"
            style={{
              fontFamily: "var(--font-quicksand)",
              backgroundColor: '#E07A5F',
              color: 'white',
              border: 'none',
              boxShadow: '0 8px 20px rgba(224, 122, 95, 0.4)'
            }}
            onClick={() => {
              if (existingUser || currentUser.trim()) {
                setIsFading(true);
                setHide(true);
                if (!existingUser) {
                  onSubmit(currentUser);
                }
              }
            }}
          >
            {existingUser ? 'Go to Memories' : 'Begin Your Journey'}
            <ArrowRight size={20} className="animate-pulse sm:w-6 sm:h-6" />
          </Button>

          {/* Bottom decorative text */}
          <p
            className="mt-6 sm:mt-8 text-center text-xs sm:text-sm italic opacity-70 px-4"
            style={{ fontFamily: "var(--font-quicksand)", color: '#8B7355' }}
          >
            Every moment is a memory waiting to be cherished
          </p>
        </div>
      </div>
    </div>
  );
}
