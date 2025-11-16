import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'

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
    
    if (length <= 30) return `${baseSize * 1}rem`; // Short text: full size
    if (length <= 50) return `${baseSize * 0.95}rem`; // Medium text: slightly smaller
    if (length <= 70) return `${baseSize * 0.9}rem`; // Long text: smaller
    return `${baseSize * 0.6}rem`; // Very long text: smallest
}

export default function DiaryModal({ paragraphs, images, onDelete }) {
  const outerRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const handleSaveAsImage = async () => {
    if (!outerRef.current) return;
    
    setIsSaving(true);
    
    try {
      const element = outerRef.current;
      
      // Wait for any animations to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Capture the element as a canvas, excluding export buttons
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality (2x resolution)
        useCORS: true,
        logging: false,
        backgroundColor: '#FFF8E7',
        allowTaint: true,
        imageTimeout: 0,
        ignoreElements: (el) => el.classList?.contains('export-buttons'),
      });
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Failed to create image');
        }
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        link.download = `diary-entry-${date}.png`;
        link.href = url;
        link.click();
        
        // Cleanup
        URL.revokeObjectURL(url);
        setIsSaving(false);
      }, 'image/png', 1.0);
      
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Failed to save image. Please try again.');
      setIsSaving(false);
    }
  };

  const handleExportToPDF = async () => {
    if (!outerRef.current) return;
    
    setIsExportingPDF(true);
    
    try {
      const element = outerRef.current;
      
      // Wait for any animations to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Capture the element as a canvas with high quality, excluding export buttons
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#FFF8E7',
        allowTaint: true,
        imageTimeout: 0,
        ignoreElements: (el) => el.classList?.contains('export-buttons'),
      });
      
      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add the canvas as an image to the PDF
      const imgData = canvas.toDataURL('image/png');
      
      // Handle multiple pages if content is too long
      let heightLeft = imgHeight;
      let position = 0;
      const pageHeight = 297; // A4 height in mm
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Generate filename with date
      const date = new Date().toISOString().split('T')[0];
      const filename = `diary-entry-${date}.pdf`;
      
      // Save the PDF
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div ref={outerRef} className="flex flex-col items-center gap-8 px-4 py-6">
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

        {/* Export buttons */}
        <div className="export-buttons w-full max-w-2xl mx-auto mt-6 px-4 flex flex-col items-center gap-4">
          <div className="flex justify-center gap-3">
            <Button
              variant="default"
              onClick={handleSaveAsImage}
              disabled={isSaving || isExportingPDF}
              className="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white px-6 py-3"
            >
              {isSaving ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Saving...
                </>
              ) : (
                <>📷 Save as Image</>
              )}
            </Button>
            
            <Button
              variant="default"
              onClick={handleExportToPDF}
              disabled={isSaving || isExportingPDF}
              className="bg-[#81B29A] hover:bg-[#81B29A]/90 text-white px-6 py-3"
            >
              {isExportingPDF ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Exporting...
                </>
              ) : (
                <>📄 Export to PDF</>
              )}
            </Button>
          </div>
          
          {/* Delete button */}
          {onDelete && (
            <Button
              variant="outline"
              onClick={onDelete}
              disabled={isSaving || isExportingPDF}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300 text-sm px-4 py-2"
            >
              🗑️ Delete Entry
            </Button>
          )}
        </div>
    </div>
  );
}
