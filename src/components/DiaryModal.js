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
    <div
      className="
        flex flex-col
        items-center
        gap-10
        bg-[ #faebd7]
        px-4
        py-6
        border-2
        rounded-lg
        border-[#FFF3F2]
      "
    >
      {paragraphs.map((text, index) => {
        const imgs = images ? Object.keys(images).filter((file) => {
          const meta = images[file];
          // meta expected to be [paragraphIndex, description]
          return Array.isArray(meta) && Number(meta[0]) === index;
        }) : [];

        return (
          <div
            key={index}
            className="

              max-w-xl
              mx-auto
              mb-6               /* ≈ 24px, keeps blocks aligned to lines */
              px-5
              leading-6          /* ≈ 24px, matches notebook line spacing */
              rounded-lg
            "
          >
            {/* Paragraph text */}
            <p className="font-serif mb-3" style={{ fontFamily: 'var(--font-quicksand)' }}>
              {text}
            </p>

            {/* Images for this paragraph (render all) */}
            {imgs.map((file) => {
              const meta = images[file] || [];
              const description = meta[1] ?? '';
              const random = randomPercent();
              const randomPostIt = randomPostIti();
              console.log("Random Post-it index:" + randomPostIt);

              return (
                <div key={file} className="mt-3 relative w-full mb-10 overflow-visible">
                  <img
                    src={`/${file}`}
                    alt={`Paragraph ${index} image - ${file}`}
                    className="w-full rounded-md block mb-10"
                  />

                  {/* Post-it positioned over the image */}
                  <div
                    className={`absolute top-[75%] drop-shadow-xl z-10`}
                    style={{ left: `${random}%` }}
                  >
                    <img
                      className="absolute top-0 :w-20 h-20 sm:w-32 sm:h-32"
                      src={`/${post_its[randomPostIt]}`}
                    //   src="/post-it.png"
                      alt="post-it"
                    />

                    <div className=" -rotate-4 w-20 h-20 sm:w-32 sm:h-32  flex items-center justify-center p-2 text-sm text-center">
                      <span className='text-[10px] sm:text-sm'>{description}</span>
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
