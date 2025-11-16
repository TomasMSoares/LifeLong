// Gemini diary entry generation route (structured output with image mapping)
// Accepts POST JSON: { transcript: string, userName: string, imageData: Array<{id, base64}> }
// Returns: { paragraphs: string[], imageParagraphMapping: { [imageId]: paragraphIndex } }

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { formatGenerateEntryPrompt } from '@/lib/prompts';

export const runtime = 'nodejs';
export const maxDuration = 60; // Allow up to 60 seconds for image processing

const DEFAULT_MODEL = process.env.GEMINI_MODEL_ID || 'gemini-2.5-flash';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Define Zod schema for structured output: array of paragraph strings
// Using camelCase for consistency with client-side code
const outputSchema = z.object({
  paragraphs: z.array(z.string().describe('A single cleaned, warm, readable diary paragraph.'))
    .describe('An array of paragraphs in order of display.'),
  imageParagraphMapping: z.record(
    z.string().describe('Image ID'),
    z.number().int().min(0).describe('0-based paragraph index - image appears AFTER this paragraph')
  ).describe('Mapping of image IDs to paragraph indices. EVERY image MUST be mapped to exactly one paragraph. Each paragraph may have 0 to 3 images.'),
  imageDescriptions: z.record(
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
    
    console.log(`Processing entry: ${transcript.length} chars, ${imageData.length} images, user: ${userName}`);
    
    // Validate image data to prevent issues
    if (imageData.length > 6) {
      return Response.json({ error: 'Maximum 6 images allowed per entry' }, { status: 400 });
    }
    
    // Check for missing or invalid image IDs
    const validImageData = imageData.filter(img => {
      if (!img || !img.id) {
        console.warn('Skipping image with missing ID');
        return false;
      }
      if (!img.base64 || typeof img.base64 !== 'string') {
        console.warn(`Skipping image ${img.id} with invalid base64 data`);
        return false;
      }
      return true;
    });
    
    console.log(`Valid images: ${validImageData.length}/${imageData.length}`);

    // Format the user prompt with actual values
    const userPrompt = formatGenerateEntryPrompt(transcript, userName, validImageData.map(img => img.id));

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // Use structured output
    const jsonSchema = zodToJsonSchema(outputSchema);
    
    // Build multimodal content: text prompt + images
    const contentParts = [{ text: userPrompt }];
    
    // Add images as inline data (base64)
    validImageData.forEach(({ id, base64 }) => {
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
          console.log(`Added image ${id} (${matches[1]})`);
        } else {
          console.warn(`Invalid base64 format for image ${id}`);
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
    
    let paragraphs, imageParagraphMapping, imageDescriptions;
    try {
      const parsed = JSON.parse(rawText);
      console.log('Parsed response keys:', Object.keys(parsed));
      
      // Validate with Zod
      const validated = outputSchema.parse(parsed);

      paragraphs = validated.paragraphs.map(p => p.trim()).filter(Boolean);
      imageParagraphMapping = validated.imageParagraphMapping || {};
      imageDescriptions = validated.imageDescriptions || {};
      
      console.log('Validated - Paragraphs:', paragraphs.length, 'Images mapped:', Object.keys(imageParagraphMapping).length);
      
      // Validate constraints
      const providedImageIds = validImageData.map(img => img.id);
      const mappedImageIds = Object.keys(imageParagraphMapping);
      
      // Check all images are mapped
      const unmappedImages = providedImageIds.filter(id => !mappedImageIds.includes(id));
      if (unmappedImages.length > 0) {
        console.warn('Warning: Not all images were mapped by LLM:', unmappedImages);
        // Add unmapped images to first paragraph as fallback
        unmappedImages.forEach(id => {
          imageParagraphMapping[id] = 0;
          imageDescriptions[id] = imageDescriptions[id] || 'A special moment';
        });
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
      console.warn('No valid paragraphs, using fallback');
      paragraphs = fallbackSplit(transcript).map(obj => obj.text);
      imageParagraphMapping = {};
      imageDescriptions = {};
    }
    
    // Ensure all images have descriptions
    validImageData.forEach(({ id }) => {
      if (!imageDescriptions[id]) {
        imageDescriptions[id] = 'A precious memory';
        console.log(`Added default description for image ${id}`);
      }
    });
    
    console.log('Final response:', {
      paragraphs: paragraphs.length,
      imageMappings: Object.keys(imageParagraphMapping).length,
      imageDescriptions: Object.keys(imageDescriptions).length
    });

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
