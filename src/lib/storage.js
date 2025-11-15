/**
 * Storage utilities for diary entries
 * TODO: Implement actual localStorage/database logic
 */

export function loadEntries() {
  // TODO: Load from localStorage
  // const saved = localStorage.getItem('memoryRoadEntries');
  // return saved ? JSON.parse(saved) : [];

  return []; // Placeholder
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
