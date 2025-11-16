// Gemini diary entry generation route (structured output with image mapping)
// Accepts POST JSON: { transcript: string, userName: string, imageData: Array<{id, base64}> }
// Returns: { paragraphs: string[], imageParagraphMapping: { [imageId]: paragraphIndex } }

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { formatGenerateEntryPrompt } from '@/lib/prompts';

export const runtime = 'nodejs';

const DEFAULT_MODEL = process.env.GEMINI_MODEL_ID || 'gemini-2.5-flash';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Define Zod schema for structured output: array of paragraph strings
const outputSchema = z.object({
  paragraphs: z.array(z.string().describe('A single cleaned, warm, readable diary paragraph.'))
    .describe('An array of paragraphs in order of display.'),
  image_paragraph_mapping: z.record(
    z.string().describe('Image ID'),
    z.number().int().min(0).describe('0-based paragraph index - image appears AFTER this paragraph')
  ).describe('Mapping of image IDs to paragraph indices. EVERY image MUST be mapped to exactly one paragraph. Each paragraph may have 0 to 3 images.'),
  image_descriptions: z.record(
    z.string().describe('Image ID'),
    z.string().max(150).describe('One-sentence description of the image (max 10 words)')
  ).describe('Short descriptions for each image. Use warm, simple language.')
}).describe('Diary entry with paragraphs, image associations, and image descriptions.');

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
    const imageData = body.imageData || []; // Array of { id, base64 }

    // Format the user prompt with actual values
    const userPrompt = formatGenerateEntryPrompt(transcript, userName, imageData.map(img => img.id));

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // Use structured output
    const jsonSchema = zodToJsonSchema(outputSchema);
    
    // Build multimodal content: text prompt + images
    const contentParts = [{ text: userPrompt }];
    
    // Add images as inline data (base64)
    imageData.forEach(({ id, base64 }) => {
      if (base64) {
        // Extract mime type and data from base64 string
        const matches = base64.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          contentParts.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2]
            }
          });
        }
      }
    });
    
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: contentParts,
      config: {
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
        responseJsonSchema: jsonSchema,
      },
    });

    const rawText = response.text || '{}';
    console.log('Gemini raw response:', rawText);
    
    let paragraphs, imageParagraphMapping, imageDescriptions;
    try {
      const parsed = JSON.parse(rawText);
      
      // Validate with Zod
      const validated = outputSchema.parse(parsed);

      paragraphs = validated.paragraphs.map(p => p.trim()).filter(Boolean);
      imageParagraphMapping = validated.image_paragraph_mapping || {};
      imageDescriptions = validated.image_descriptions || {};
      
      // Validate constraints
      const providedImageIds = imageData.map(img => img.id);
      const mappedImageIds = Object.keys(imageParagraphMapping);
      
      // Check all images are mapped
      const unmappedImages = providedImageIds.filter(id => !mappedImageIds.includes(id));
      if (unmappedImages.length > 0) {
        console.warn('Warning: Not all images were mapped by LLM:', unmappedImages);
      }
      
      // Check max 3 images per paragraph
      const paragraphImageCounts = {};
      Object.values(imageParagraphMapping).forEach(paragraphIndex => {
        paragraphImageCounts[paragraphIndex] = (paragraphImageCounts[paragraphIndex] || 0) + 1;
      });
      
      const overloadedParagraphs = Object.entries(paragraphImageCounts)
        .filter(([_, count]) => count > 3);
      
      if (overloadedParagraphs.length > 0) {
        console.warn('Warning: Some paragraphs have more than 3 images:', overloadedParagraphs);
      }
    } catch (parseErr) {
      console.error('Schema validation failed, using fallback:', parseErr);
      console.error('Raw text was:', rawText);
      paragraphs = fallbackSplit(transcript).map(obj => obj.text);
      imageParagraphMapping = {}; // No image mapping on fallback
      imageDescriptions = {}; // No descriptions on fallback
    }

    if (!paragraphs || !paragraphs.length) {
      paragraphs = fallbackSplit(transcript).map(obj => obj.text);
      imageParagraphMapping = {};
      imageDescriptions = {};
    }

    return Response.json({ 
      paragraphs, 
      imageParagraphMapping,
      imageDescriptions
    }, { status: 200 });
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
