// Gemini transcript cleanup route (structured output)
// Accepts POST JSON: { transcript: string }
// Returns: { paragraphs: string[] } where each string is a cleaned narrative paragraph.

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { formatCleanupPrompt } from '@/lib/prompts';

export const runtime = 'nodejs';

const DEFAULT_MODEL = process.env.GEMINI_MODEL_ID || 'gemini-2.5-flash';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Define Zod schema for structured output: array of paragraph strings
const paragraphsSchema = z.object({
  paragraphs: z.array(z.string().describe('A single cleaned, warm, readable diary paragraph.'))
}).describe('List of cleaned narrative diary paragraphs in order.');

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
    const userName = body.userName || 'they'; // Default to gender-neutral if name not provided

    // Format the user prompt with actual values
    const userPrompt = formatCleanupPrompt(transcript, userName);

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // Use structured output exactly as shown in gemini-structured-out.md
    const jsonSchema = zodToJsonSchema(paragraphsSchema);
    
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: userPrompt, // Combined system + user prompt as plain string
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: jsonSchema,
      },
    });

    const rawText = response.text || '[]';
    
    let paragraphs;
    try {
      const parsed = JSON.parse(rawText);
      
      // Validate with Zod
      const validated = paragraphsSchema.parse(parsed);

      paragraphs = validated.paragraphs.map(p => p.trim()).filter(Boolean);
    } catch (parseErr) {
      console.error('Schema validation failed, using fallback:', parseErr);
      console.error('Raw text was:', rawText);
      paragraphs = fallbackSplit(transcript).map(obj => obj.text);
    }

    if (!paragraphs || !paragraphs.length) {
      paragraphs = fallbackSplit(transcript).map(obj => obj.text);
    }

    return Response.json({ paragraphs }, { status: 200 });
  } catch (err) {
    console.error('Cleanup route error:', err);
    return Response.json({ error: 'Unexpected error during cleanup' }, { status: 500 });
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
