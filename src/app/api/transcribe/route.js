// ElevenLabs Speech-to-Text proxy route
// Accepts a multipart/form-data POST with `file` (audio blob)
// Forwards to ElevenLabs and returns { transcript, raw } JSON

export const runtime = 'nodejs';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/speech-to-text';

export async function POST(request) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'Missing ELEVENLABS_API_KEY' }, { status: 500 });
    }

    const incoming = await request.formData();
    const file = incoming.get('file');
    const languageCode = incoming.get('language_code') || undefined;

    if (!file || typeof file === 'string') {
      return Response.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const modelId = process.env.ELEVENLABS_STT_MODEL_ID; // optional

    const fd = new FormData();
    fd.append('file', file, file.name || `audio.${file.type?.split('/')[1] || 'webm'}`);
    if (modelId) fd.append('model_id', modelId);
    if (languageCode) fd.append('language_code', languageCode);

    const res = await fetch(ELEVENLABS_API_URL, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        // Do not set Content-Type; fetch will set the correct multipart boundary
      },
      body: fd,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return Response.json({ error: 'Transcription failed', details: text }, { status: res.status });
    }

    const data = await res.json();
    // Simple single-channel response: expect `text` field only
    if (typeof data?.text !== 'string' || !data.text.trim()) {
      return Response.json({ error: 'No transcript text returned', raw: data }, { status: 502 });
    }
    return Response.json({ transcript: data.text }, { status: 200 });
  } catch (err) {
    console.error('Transcription route error:', err);
    return Response.json({ error: 'Unexpected error during transcription' }, { status: 500 });
  }
}
