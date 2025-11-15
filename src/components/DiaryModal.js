import React from 'react'

export default function DiaryModal({ paragraphs, images }) {
  return (
    <div
      className="
        bg-[repeating-linear-gradient(#d6d6d6_0px,#d6d6d6_1px,transparent_1px,transparent_24px)]
        bg-[url('/notebook-paper-texture.png')]
        px-4
        py-6
      "
    >
      {paragraphs.map((text, index) => {
        const imageFiles = Object.keys(images).filter(
          (file) => Number(images[file]) === index
        );
        const firstImage = imageFiles[0] ?? null;

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
            <p className="font-serif"
            style={{ fontFamily: "var(--font-quicksand)" }}
            >
              {text}
            </p>

            {/* Image */}
            {firstImage && (
              <div className="mt-3">
                <img
                  src={`/${firstImage}`}
                  alt={`Paragraph ${index} image`}
                  className="w-full rounded-md block mb-10"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
