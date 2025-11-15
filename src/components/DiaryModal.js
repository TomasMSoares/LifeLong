import React from 'react'

function randomPercent() {
  return Math.floor(Math.random() * (90 - 10 + 1)) + 10;
}

export default function DiaryModal({ paragraphs, images }) {
  return (
    <div
      className="
        flex flex-col
        items-center
        gap-10
        bg-white
        px-4
        py-6
      "
    >
      {paragraphs.map((text, index) => {
        const imageFiles = Object.keys(images).filter(
          (file) => Number(images[file]) === index
        );
        const firstImage = imageFiles[0] ?? null;
        const random = randomPercent();
        const left_random = `left-[${random}%]`;
        console.log(left_random);

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
            {/* <p className="font-serif"
            style={{ fontFamily: "var(--font-quicksand)" }}
            >
              {text}
            </p> */}

            {/* Image */}
            {firstImage && (
              <div className="mt-3 relative ">
                <img
                  src={`/${firstImage}`}
                  alt={`Paragraph ${index} image`}
                  className="w-full rounded-md block mb-10"
                />
                <div className={`absolute top-[80%] ${left_random} drop-shadow-xl`}>
                    <img 
                    className=' absolute top-0 w-32 h-32'
                    src='/post-it.png'
                    />
                    <div
                    className=' mt-5 -rotate-4  w-32 h-32'
                    >
                        <span>Hello</span>
                    </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
