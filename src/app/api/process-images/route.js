// Process images and map them to paragraphs
// Accepts POST JSON: { paragraphs: string[], imageData: Array<{id, base64}> }
// Returns: { imageParagraphMapping: { [imageId]: paragraphIndex }, imageDescriptions: { [imageId]: string } }

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const runtime = 'nodejs';
export const maxDuration = 60;

const DEFAULT_MODEL = process.env.GEMINI_MODEL_ID || 'gemini-2.5-flash';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Schema for image processing output
const imageOutputSchema = z.object({
  imageParagraphMapping: z.record(
    z.string().describe('Image ID'),
    z.number().int().min(0).describe('0-based paragraph index - image appears AFTER this paragraph')
  ).describe('Mapping of image IDs to paragraph indices. EVERY image MUST be mapped to exactly one paragraph. Each paragraph may have 0 to 3 images.'),
  imageDescriptions: z.record(
    z.string().describe('Image ID'),
    z.string().max(150).describe('One-sentence description of the image (max 10 words)')
  ).describe('Short descriptions for each image. Use warm, simple language.')
}).describe('Image mappings and descriptions for diary entry.');

export async function POST(request) {
  try {
    if (!GEMINI_API_KEY) {
      return Response.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
    }

    const body = await request.json().catch(() => null);
    if (!body || !Array.isArray(body.paragraphs) || !Array.isArray(body.imageData)) {
      return Response.json({ error: 'Invalid input: need paragraphs and imageData' }, { status: 400 });
    }

    const paragraphs = body.paragraphs;
    const imageData = body.imageData;

    console.log(`Processing ${imageData.length} images for ${paragraphs.length} paragraphs`);

    if (imageData.length === 0) {
      return Response.json({
        imageParagraphMapping: {},
        imageDescriptions: {}
      }, { status: 200 });
    }

    if (imageData.length > 6) {
      return Response.json({ error: 'Maximum 6 images allowed per entry' }, { status: 400 });
    }

    // Validate image data
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

    if (validImageData.length === 0) {
      return Response.json({
        imageParagraphMapping: {},
        imageDescriptions: {}
      }, { status: 200 });
    }

    // Create prompt for image processing
    const imageIds = validImageData.map(img => img.id);
    const userPrompt = `You are analyzing images for a diary entry. The entry has ${paragraphs.length} paragraphs.

PARAGRAPHS:
${paragraphs.map((p, idx) => `[${idx}] ${p}`).join('\n\n')}

IMAGES TO PROCESS: ${imageIds.join(', ')}

For each image provided:
1. Generate a warm, simple description (max 10 words)
2. Map the image to the most relevant paragraph index (0-based)
3. Each paragraph can have 0-3 images
4. Distribute images evenly across paragraphs when possible

The images are provided in order after this text prompt.`;

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const jsonSchema = zodToJsonSchema(imageOutputSchema);

    // Build multimodal content: text prompt + images
    const contentParts = [{ text: userPrompt }];

    validImageData.forEach(({ id, base64 }) => {
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
    });

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: contentParts,
      config: {
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
        responseJsonSchema: jsonSchema,
      },
    });

    const rawText = response.text || '{}';

    let imageParagraphMapping, imageDescriptions;
    try {
      const parsed = JSON.parse(rawText);
      console.log('Parsed image response keys:', Object.keys(parsed));

      const validated = imageOutputSchema.parse(parsed);
      imageParagraphMapping = validated.imageParagraphMapping || {};
      imageDescriptions = validated.imageDescriptions || {};

      console.log('Validated - Images mapped:', Object.keys(imageParagraphMapping).length);

      // Validate all images are mapped
      const mappedImageIds = Object.keys(imageParagraphMapping);
      const unmappedImages = imageIds.filter(id => !mappedImageIds.includes(id));

      if (unmappedImages.length > 0) {
        console.warn('Warning: Not all images were mapped, adding to first paragraph:', unmappedImages);
        unmappedImages.forEach(id => {
          imageParagraphMapping[id] = 0;
          imageDescriptions[id] = imageDescriptions[id] || 'A special moment';
        });
      }

      // Ensure all images have descriptions
      validImageData.forEach(({ id }) => {
        if (!imageDescriptions[id]) {
          imageDescriptions[id] = 'A precious memory';
          console.log(`Added default description for image ${id}`);
        }
      });

    } catch (parseErr) {
      console.error('Image processing failed:', parseErr);
      console.error('Raw text was:', rawText);

      // Fallback: distribute images evenly
      imageParagraphMapping = {};
      imageDescriptions = {};
      validImageData.forEach((img, idx) => {
        const paragraphIndex = Math.floor(idx * paragraphs.length / validImageData.length);
        imageParagraphMapping[img.id] = Math.min(paragraphIndex, paragraphs.length - 1);
        imageDescriptions[img.id] = 'A precious memory';
      });
    }

    console.log('Image processing complete:', {
      mappings: Object.keys(imageParagraphMapping).length,
      descriptions: Object.keys(imageDescriptions).length
    });

    return Response.json({
      imageParagraphMapping,
      imageDescriptions
    }, { status: 200 });

  } catch (err) {
    console.error('Process images route error:', err);
    return Response.json({ error: 'Unexpected error during image processing' }, { status: 500 });
  }
}
