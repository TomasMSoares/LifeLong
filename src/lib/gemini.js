/**
 * Generate diary entry with image-to-paragraph mapping
 * @param {string} transcript Raw transcribed text
 * @param {string} userName User's name for third-person narration
 * @param {Array<{id: string, base64: string}>} imageData Array of image data with IDs and base64
 * @returns {Promise<{paragraphs: string[], imageParagraphMapping: Object}>}
 */
export async function generateDiaryEntry(transcript, userName, imageData = []) {
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
    throw new Error('Invalid paragraphs array');
  }
  
  return {
    paragraphs: data.paragraphs.map(p => p.trim()).filter(Boolean),
    imageParagraphMapping: data.imageParagraphMapping || {}
  };
}
