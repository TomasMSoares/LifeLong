import React from 'react'

const post_its= ["post-it.png", "post-it2.png", "post-it3.png"]

function randomPercent() {
    return Math.floor(Math.random() * (70 - (-10) + 1)) - 10;
}

function randomPostIti() {
    return (Math.floor(Math.random() * (3 )) + 1)  - 1;
}

/**
 * Calculate dynamic font size based on text length to prevent overflow
 * Shorter text gets larger font, longer text gets smaller font
 */
function getDynamicFontSize(text, isMobile = false) {
    const length = text?.length || 0;
    
    // Base sizes for mobile and desktop
    const baseSize = isMobile ? 0.75 : 1; // rem units
    
    if (length <= 20) return `${baseSize * 1}rem`; // Short text: full size
    if (length <= 35) return `${baseSize * 0.85}rem`; // Medium text: slightly smaller
    if (length <= 50) return `${baseSize * 0.7}rem`; // Long text: smaller
    return `${baseSize * 0.6}rem`; // Very long text: smallest
}

export default function DiaryModal({ paragraphs, images }) {

  return (
    <div className="flex flex-col items-center gap-8 px-4 py-6">
      {paragraphs.map((text, index) => {
        const imgs = images ? Object.keys(images).filter((imageId) => {
          const meta = images[imageId];
          // meta expected to be [paragraphIndex, description, blobUrl]
          return Array.isArray(meta) && Number(meta[0]) === index;
        }) : [];

        return (
          <div
            key={index}
            className="w-full max-w-2xl mx-auto"
          >
            {/* Paragraph text */}
            <p
              className="text-lg sm:text-xl leading-relaxed text-[#4a4a4a] mb-6 px-4"
              style={{ fontFamily: 'var(--font-quicksand)' }}
            >
              {text}
            </p>

            {/* Images for this paragraph (render all) */}
            {imgs.map((imageId) => {
              const meta = images[imageId] || [];
              const description = meta[1] ?? '';
              const blobUrl = meta[2] || null;
              const random = randomPercent();
              const randomPostIt = randomPostIti();

              if (!blobUrl) return null;

              return (
                <div
                  key={imageId}
                  className="relative w-full mb-12 px-4"
                >
                  {/* Image with cleaner styling */}
                  <div className="relative overflow-hidden rounded-xl shadow-lg">
                    <img
                      src={blobUrl}
                      alt={`Paragraph ${index} image - ${description || 'Memory photo'}`}
                      className="w-full h-auto object-cover"
                    />
                  </div>

                  {/* Post-it positioned over the image */}
                  <div
                    className="absolute top-[75%] z-10 transition-transform hover:scale-105"
                    style={{ left: `${Math.max(5, Math.min(random, 70))}%` }}
                  >
                    <img
                      className="w-24 h-24 sm:w-36 sm:h-36 drop-shadow-2xl"
                      src={`/${post_its[randomPostIt]}`}
                      alt="post-it"
                    />

                    <div
                      className="-rotate-3 absolute inset-0 flex items-center justify-center p-3 sm:p-5"
                      style={{ top: '8%' }}
                    >
                      <span
                        className="font-medium text-center text-[#2c2c2c] leading-snug break-words"
                        style={{ 
                          fontFamily: 'var(--font-quicksand)',
                          fontSize: getDynamicFontSize(description, true)
                        }}
                      >
                        {description}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
