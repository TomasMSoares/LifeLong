/**
 * Client helper to call our ElevenLabs STT proxy.
 * @param {Blob} audioBlob - Recorded audio blob from MediaRecorder
 * @param {Object} options - Optional controls
 * @param {string} [options.languageCode] - BCP-47 language code (e.g., 'en')
 * @returns {Promise<{ transcript: string, raw?: any }>} - Transcript result
 */
export async function transcribeWithElevenLabs(audioBlob, options = {}) {
  const { languageCode } = options;
  const fd = new FormData();
  const type = audioBlob?.type || 'audio/webm';
  const ext = type.split('/')[1] || 'webm';
  fd.append('file', audioBlob, `recording.${ext}`);
  if (languageCode) fd.append('language_code', languageCode);

  const res = await fetch('/api/transcribe', {
    method: 'POST',
    body: fd,
  });

  if (!res.ok) {
    let details = '';
    try { details = await res.text(); } catch {}
    throw new Error(`Transcription failed (${res.status}): ${details}`);
  }

  const data = await res.json();
  if (!data?.transcript) {
    throw new Error('No transcript returned from server');
  }
  return data;
}
