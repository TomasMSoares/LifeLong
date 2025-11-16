/**
 * Generate diary entry with image-to-paragraph mapping (split into 2 API calls to avoid timeouts)
 * @param {string} transcript Raw transcribed text
 * @param {string} userName User's name for third-person narration
 * @param {Array<{id: string, base64: string}>} imageData Array of image data with IDs and base64
 * @returns {Promise<{paragraphs: string[], imageParagraphMapping: Object, imageDescriptions: Object}>} Generated entry data
 */
export async function generateDiaryEntry(transcript, userName, imageData = []) {
  console.log('[generateDiaryEntry] Starting - Step 1: Generate text paragraphs');

  // STEP 1: Generate paragraphs from transcript (text only, fast)
  const textRes = await fetch('/api/generate-entry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, userName }),
  });

  if (!textRes.ok) {
    let details = '';
    try { details = await textRes.text(); } catch {}
    throw new Error(`Text generation failed (${textRes.status}): ${details}`);
  }

  const textData = await textRes.json();

  if (!Array.isArray(textData?.paragraphs) || !textData.paragraphs.every(p => typeof p === 'string')) {
    throw new Error('Invalid paragraphs array');
  }

  const paragraphs = textData.paragraphs.map(p => p.trim()).filter(Boolean);
  console.log(`[generateDiaryEntry] Step 1 complete - Generated ${paragraphs.length} paragraphs`);

  // STEP 2: Process images if provided (separate API call to reset timeout)
  let imageParagraphMapping = {};
  let imageDescriptions = {};

  if (imageData && imageData.length > 0) {
    console.log(`[generateDiaryEntry] Starting - Step 2: Process ${imageData.length} images`);

    const imageRes = await fetch('/api/process-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paragraphs, imageData }),
    });

    if (!imageRes.ok) {
      let details = '';
      try { details = await imageRes.text(); } catch {}
      console.warn(`Image processing failed (${imageRes.status}): ${details}. Continuing without image mappings.`);
    } else {
      const imageResData = await imageRes.json();
      imageParagraphMapping = imageResData.imageParagraphMapping || {};
      imageDescriptions = imageResData.imageDescriptions || {};
      console.log(`[generateDiaryEntry] Step 2 complete - Mapped ${Object.keys(imageParagraphMapping).length} images`);
    }
  } else {
    console.log('[generateDiaryEntry] No images to process, skipping Step 2');
  }

  return {
    paragraphs,
    imageParagraphMapping,
    imageDescriptions
  };
}
