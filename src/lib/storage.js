/**
 * Storage utilities for diary entries
 * Integrated with Gemini AI API and IndexedDB for images
 */

import { generateDiaryEntry } from '@/lib/gemini';
import { getImagesAsBase64, getImageUrl } from '@/lib/imageDB';

// Generate some sample entries for testing
function generateSampleEntries() {
  const samples = [
    {
      id: '1',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      voiceTranscript: 'Had a wonderful walk in the park today.',
      images: ['/casal-idoso-idosa-velho-e-velha-1651674188773_v2_900x506.jpg'],
      aiGeneratedText: 'What a beautiful day it was yesterday! The sun was shining as I took my morning walk through the park...',
      paragraphs: ['What a beautiful day it was yesterday! The sun was shining as I took my morning walk through the park...'],
      imageParagraphMapping: {},
      position: { x: 0, y: 300 }
    },
    {
      id: '2',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      voiceTranscript: 'Visited my grandchildren today.',
      images: ['/casal-idoso-idosa-velho-e-velha-1651674188773_v2_900x506.jpg'],
      aiGeneratedText: 'Two days ago, I had the joy of spending time with my grandchildren. Their laughter filled the house...',
      paragraphs: ['Two days ago, I had the joy of spending time with my grandchildren. Their laughter filled the house...'],
      imageParagraphMapping: {},
      position: { x: 0, y: 600 }
    },
    {
      id: '3',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      voiceTranscript: 'Baked cookies with an old recipe.',
      images: [],
      aiGeneratedText: 'Five days ago, I found my grandmother\'s old recipe book and decided to bake her famous cookies...',
      paragraphs: ['Five days ago, I found my grandmother\'s old recipe book and decided to bake her famous cookies...'],
      imageParagraphMapping: {},
      position: { x: 0, y: 900 }
    },
    {
      id: '4',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
      voiceTranscript: 'Had coffee with an old friend.',
      images: ['/casal-idoso-idosa-velho-e-velha-1651674188773_v2_900x506.jpg'],
      aiGeneratedText: 'Last week, I reconnected with an old friend over coffee. We reminisced about the good old days...',
      paragraphs: ['Last week, I reconnected with an old friend over coffee. We reminisced about the good old days...'],
      imageParagraphMapping: {},
      position: { x: 0, y: 1200 }
    },
    {
      id: '5',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
      voiceTranscript: 'Started reading a new book.',
      images: [],
      aiGeneratedText: 'Two weeks ago, I began reading a fascinating novel that transported me to another world...',
      paragraphs: ['Two weeks ago, I began reading a fascinating novel that transported me to another world...'],
      imageParagraphMapping: {},
      position: { x: 0, y: 1500 }
    }
  ];
  return samples;
}

export function loadEntries() {
  // Load from localStorage if available
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('memoryRoadEntries');
      if (saved) {
        const entries = JSON.parse(saved);
        return entries;
      }
    } catch (err) {
      console.error('Failed to load entries from localStorage:', err);
    }
  }

  // Fall back to sample entries
  return generateSampleEntries();
}

/**
 * Save a new diary entry with AI-generated text
 * @param {string} voiceText - Transcribed voice input
 * @param {string[]} imageIds - Array of image IDs from IndexedDB
 * @param {string} userName - User's name (optional)
 * @returns {Promise<Object>} - The created entry
 */
export async function saveEntry(voiceText, imageIds = [], userName = 'they') {
  try {
    // Convert image IDs to base64 for API call
    const imageData = await getImagesAsBase64(imageIds);

    // Call AI API to generate diary entry with image-paragraph mapping
    const { paragraphs, imageParagraphMapping } = await generateDiaryEntry(
      voiceText,
      userName,
      imageData
    );

    // Convert image IDs to URLs for display (using first image for the orb)
    const imageUrls = [];
    for (const imageId of imageIds) {
      const url = await getImageUrl(imageId);
      if (url) imageUrls.push(url);
    }

    // Create new entry
    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      voiceTranscript: voiceText,
      images: imageUrls, // For display in memory orbs
      imageIds: imageIds, // Store IDs for future reference
      aiGeneratedText: paragraphs.join('\n\n'), // Combined text for backwards compatibility
      paragraphs: paragraphs, // Structured paragraphs
      imageParagraphMapping: imageParagraphMapping, // Which images go with which paragraphs
      position: { x: Math.random() * 800, y: Math.random() * 600 }
    };

    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        const existing = loadEntries();
        const updated = [...existing, newEntry];
        localStorage.setItem('memoryRoadEntries', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }
    }

    return newEntry;
  } catch (err) {
    console.error('Error saving entry:', err);
    throw err;
  }
}
