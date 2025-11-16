// Gemini diary entry generation route (TEXT ONLY - no images)
// Accepts POST JSON: { transcript: string, userName: string }
// Returns: { paragraphs: string[] }

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { formatGenerateEntryPrompt } from '@/lib/prompts';

export const runtime = 'nodejs';
export const maxDuration = 30; // Reduced timeout since we're only processing text

const DEFAULT_MODEL = process.env.GEMINI_MODEL_ID || 'gemini-2.5-flash';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Simplified schema for text-only generation
const outputSchema = z.object({
  paragraphs: z.array(z.string().describe('A single cleaned, warm, readable diary paragraph.'))
    .describe('An array of paragraphs in order of display.')
}).describe('Diary entry paragraphs.');

export async function POST(request) {
  try {
    if (!GEMINI_API_KEY) {
      return Response.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
    }
    const body = await request.json().catch(() => null);
    if (!body || typeof body.transcript !== 'string' || !body.transcript.trim()) {
      return Response.json({ error: 'Invalid transcript input' }, { status: 400 });
    }

    const transcript = body.transcript.trim();
    const userName = body.userName || 'they';

    console.log(`Processing entry (text only): ${transcript.length} chars, user: ${userName}`);

    // Format the user prompt (no images)
    const userPrompt = formatGenerateEntryPrompt(transcript, userName, []);

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // Use structured output
    const jsonSchema = zodToJsonSchema(outputSchema);

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: [{ text: userPrompt }],
      config: {
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
        responseJsonSchema: jsonSchema,
      },
    });

    const rawText = response.text || '{}';

    let paragraphs;
    try {
      const parsed = JSON.parse(rawText);
      console.log('Parsed response keys:', Object.keys(parsed));

      // Validate with Zod
      const validated = outputSchema.parse(parsed);
      paragraphs = validated.paragraphs.map(p => p.trim()).filter(Boolean);

      console.log('Validated - Paragraphs:', paragraphs.length);
    } catch (parseErr) {
      console.error('Schema validation failed, using fallback:', parseErr);
      console.error('Raw text was:', rawText);
      paragraphs = fallbackSplit(transcript).map(obj => obj.text);
    }

    if (!paragraphs || !paragraphs.length) {
      console.warn('No valid paragraphs, using fallback');
      paragraphs = fallbackSplit(transcript).map(obj => obj.text);
    }

    console.log('Final response:', { paragraphs: paragraphs.length });

    return Response.json({ paragraphs }, { status: 200 });
  } catch (err) {
    console.error('Generate entry route error:', err);
    return Response.json({ error: 'Unexpected error during entry generation' }, { status: 500 });
  }
}

function fallbackSplit(text) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const paragraphs = [];
  let buffer = [];
  sentences.forEach((s) => {
    if (!s.trim()) return;
    buffer.push(s.trim());
    if (buffer.length >= 3) {
      paragraphs.push(buffer.join(' '));
      buffer = [];
    }
  });
  if (buffer.length) paragraphs.push(buffer.join(' '));
  return paragraphs.map((p, idx) => ({ id: idx + 1, text: p }));
}
