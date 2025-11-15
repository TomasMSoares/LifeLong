/**
 * Storage utilities for diary entries
 * TODO: Implement actual localStorage/database logic
 */

// Generate some sample entries for testing
function generateSampleEntries() {
  const samples = [
    {
      id: '1',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      voiceTranscript: 'Had a wonderful walk in the park today.',
      images: [],
      aiGeneratedText: 'What a beautiful day it was yesterday! The sun was shining as I took my morning walk through the park...',
      position: { x: 0, y: 300 }
    },
    {
      id: '2',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      voiceTranscript: 'Visited my grandchildren today.',
      images: [],
      aiGeneratedText: 'Two days ago, I had the joy of spending time with my grandchildren. Their laughter filled the house...',
      position: { x: 0, y: 600 }
    },
    {
      id: '3',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      voiceTranscript: 'Baked cookies with an old recipe.',
      images: [],
      aiGeneratedText: 'Five days ago, I found my grandmother\'s old recipe book and decided to bake her famous cookies...',
      position: { x: 0, y: 900 }
    },
    {
      id: '4',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
      voiceTranscript: 'Had coffee with an old friend.',
      images: [],
      aiGeneratedText: 'Last week, I reconnected with an old friend over coffee. We reminisced about the good old days...',
      position: { x: 0, y: 1200 }
    },
    {
      id: '5',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
      voiceTranscript: 'Started reading a new book.',
      images: [],
      aiGeneratedText: 'Two weeks ago, I began reading a fascinating novel that transported me to another world...',
      position: { x: 0, y: 1500 }
    }
  ];
  return samples;
}

export function loadEntries() {
  // TODO: Load from localStorage
  // const saved = localStorage.getItem('memoryRoadEntries');
  // return saved ? JSON.parse(saved) : [];

  // For now, return sample entries for testing
  return generateSampleEntries();
}

export async function saveEntry(voiceText, images) {
  // TODO: Call AI API to generate diary entry
  // TODO: Save to localStorage

  const newEntry = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    voiceTranscript: voiceText,
    images: images,
    aiGeneratedText: `[AI will generate beautiful text from: "${voiceText}"]`, // Placeholder
    position: { x: Math.random() * 800, y: Math.random() * 600 }
  };

  // TODO: localStorage.setItem('memoryRoadEntries', JSON.stringify([...existing, newEntry]));

  return newEntry;
}
