import React from 'react'

const post_its= ["post-it.png", "post-it2.png", "post-it3.png"]

function randomPercent() {
    return Math.floor(Math.random() * (70 - (-10) + 1)) - 10;
}

function randomPostIti() {
    return (Math.floor(Math.random() * (3 )) + 1)  - 1;
}

export default function DiaryModal({ paragraphs, images }) {

  return (
    <div className="flex flex-col items-center gap-8 px-4 py-6">
      {paragraphs.map((text, index) => {
        const imgs = images ? Object.keys(images).filter((file) => {
          const meta = images[file];
          // meta expected to be [paragraphIndex, description]
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
            {imgs.map((file) => {
              const meta = images[file] || [];
              const description = meta[1] ?? '';
              const random = randomPercent();
              const randomPostIt = randomPostIti();

              return (
                <div
                  key={file}
                  className="relative w-full mb-12 px-4"
                >
                  {/* Image with cleaner styling */}
                  <div className="relative overflow-hidden rounded-xl shadow-lg">
                    <img
                      src={`/${file}`}
                      alt={`Paragraph ${index} image - ${file}`}
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
                        className="text-xs sm:text-base font-medium text-center text-[#2c2c2c] leading-snug"
                        style={{ fontFamily: 'var(--font-quicksand)' }}
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
