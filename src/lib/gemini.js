/**
 * Generate diary entry with image-to-paragraph mapping
 * @param {string} transcript Raw transcribed text
 * @param {string} userName User's name for third-person narration
 * @param {Array<{id: string, base64: string}>} imageData Array of image data with IDs and base64
 * @returns {Promise<{paragraphs: string[], imageParagraphMapping: Object, imageDescriptions: Object}>} Generated entry data
 */
export async function generateDiaryEntry(transcript, userName, imageData = []) {
  try {
    const res = await fetch('/api/generate-entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, userName, imageData }),
    });
    
    if (!res.ok) {
      let details = '';
      try { details = await res.text(); } catch {}
      throw new Error(`Entry generation failed (${res.status}): ${details}`);
    }
    
    const data = await res.json();
    
    if (!Array.isArray(data?.paragraphs) || !data.paragraphs.every(p => typeof p === 'string')) {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid paragraphs array in response');
    }
    
    // Ensure required fields exist
    const paragraphs = data.paragraphs.map(p => p.trim()).filter(Boolean);
    const imageParagraphMapping = data.imageParagraphMapping || {};
    const imageDescriptions = data.imageDescriptions || {};
    
    // Validate that we have data for all provided images
    const providedImageIds = imageData.map(img => img.id);
    providedImageIds.forEach(id => {
      if (imageParagraphMapping[id] === undefined) {
        console.warn(`Image ${id} not mapped, defaulting to paragraph 0`);
        imageParagraphMapping[id] = 0;
      }
      if (!imageDescriptions[id]) {
        console.warn(`Image ${id} has no description, adding default`);
        imageDescriptions[id] = 'A special moment';
      }
    });
    
    console.log('Diary entry generated successfully:', {
      paragraphs: paragraphs.length,
      images: providedImageIds.length,
      mapped: Object.keys(imageParagraphMapping).length
    });
    
    return {
      paragraphs,
      imageParagraphMapping,
      imageDescriptions
    };
  } catch (error) {
    console.error('Failed to generate diary entry:', error);
    throw error;
  }
}
