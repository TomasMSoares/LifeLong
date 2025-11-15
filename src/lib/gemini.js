/**
 * Client helper to request cleaned paragraphs from transcript.
 * @param {string} transcript Raw transcribed text
 * @returns {Promise<string[]>} Array of cleaned paragraph strings
 */
export async function cleanupTranscript(transcript) {
  const res = await fetch('/api/cleanup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript }),
  });
  if (!res.ok) {
    let details = '';
    try { details = await res.text(); } catch {}
    throw new Error(`Cleanup failed (${res.status}): ${details}`);
  }
  const data = await res.json();
  if (!Array.isArray(data?.paragraphs) || !data.paragraphs.every(p => typeof p === 'string')) {
    throw new Error('Invalid paragraphs array');
  }
  return data.paragraphs.map(p => p.trim()).filter(Boolean);
}
