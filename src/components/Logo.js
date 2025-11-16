import { BookHeart, Sparkles } from 'lucide-react';

export default function Logo({ userName }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-in-left">
      <div
        className="backdrop-blur-md border-b transition-all duration-300"
        style={{
          backgroundColor: 'rgba(255, 248, 231, 0.85)',
          borderColor: 'rgba(224, 122, 95, 0.15)',
          boxShadow: '0 4px 20px rgba(224, 122, 95, 0.1)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center gap-3 group cursor-pointer">
              {/* Animated icon container */}
              <div className="relative">
                <BookHeart
                  size={36}
                  strokeWidth={1.8}
                  style={{ color: '#E07A5F' }}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
                <Sparkles
                  size={16}
                  strokeWidth={2.5}
                  style={{
                    color: '#F4A259',
                    position: 'absolute',
                    top: '-4px',
                    right: '-6px'
                  }}
                  className="animate-pulse"
                />
              </div>

              {/* Brand text */}
              <div className="flex flex-col">
                <h1
                  className="text-2xl font-bold tracking-tight transition-colors duration-300 group-hover:opacity-80"
                  style={{
                    fontFamily: 'var(--font-quicksand)',
                    color: '#BF5846',
                    letterSpacing: '-0.02em'
                  }}
                >
                  LifeLong
                </h1>
                <p
                  className="text-xs hidden sm:block"
                  style={{
                    fontFamily: 'var(--font-quicksand)',
                    color: '#8B7355',
                    fontWeight: 500,
                    marginTop: '-2px'
                  }}
                >
                  Your Memory Journey
                </p>
              </div>
            </div>

            {/* User greeting (if logged in) */}
            {userName && (
              <div className="flex items-center gap-2 animate-fade-in">
                <div
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    border: '1.5px solid rgba(129, 178, 154, 0.3)'
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: '#81B29A' }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{
                      fontFamily: 'var(--font-quicksand)',
                      color: '#8B7355'
                    }}
                  >
                    Hello, <span style={{ color: '#BF5846', fontWeight: 600 }}>{userName}</span>
                  </span>
                </div>

                {/* Mobile version - just initials */}
                <div
                  className="sm:hidden flex items-center justify-center w-10 h-10 rounded-full font-bold"
                  style={{
                    backgroundColor: '#E07A5F',
                    color: 'white',
                    fontFamily: 'var(--font-quicksand)',
                    fontSize: '16px'
                  }}
                >
                  {userName.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
