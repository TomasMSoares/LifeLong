/**
 * IndexedDB storage for diary entries
 * Stores complete diary entries with audio, transcript, and LLM-generated content
 */

const DB_NAME = 'LifeLongDB';
const DB_VERSION = 2; // Incremented to add entries store
const ENTRIES_STORE = 'entries';

/**
 * Open the IndexedDB database and create stores if needed
 * @returns {Promise<IDBDatabase>}
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create entries store if it doesn't exist
      if (!db.objectStoreNames.contains(ENTRIES_STORE)) {
        const entriesStore = db.createObjectStore(ENTRIES_STORE, { keyPath: 'id' });
        entriesStore.createIndex('date', 'date', { unique: false });
        entriesStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

/**
 * Save a new diary entry to IndexedDB
 * @param {Object} entryData - The diary entry data
 * @param {string} entryData.transcript - Raw voice transcript
 * @param {Blob} entryData.audioBlob - Audio recording blob
 * @param {Array<string>} entryData.paragraphs - LLM-generated paragraphs
 * @param {Object} entryData.imageParagraphMapping - Image ID to paragraph index mapping
 * @param {Array<string>} entryData.imageIds - Array of image IDs associated with this entry
 * @param {string} [entryData.userName] - User's name for the diary
 * @returns {Promise<string>} - Returns the generated entry ID
 */
export async function saveDiaryEntry(entryData) {
  const db = await openDB();
  const id = `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();
  
  const entry = {
    id,
    date: new Date(now).toISOString(),
    timestamp: now,
    transcript: entryData.transcript || '',
    audioBlob: entryData.audioBlob || null,
    // Store the complete LLM response as JSON
    llmResponse: {
      paragraphs: entryData.paragraphs || [],
      imageParagraphMapping: entryData.imageParagraphMapping || {}
    },
    imageIds: entryData.imageIds || [],
    userName: entryData.userName || 'they',
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ENTRIES_STORE], 'readwrite');
    const store = transaction.objectStore(ENTRIES_STORE);
    const request = store.add(entry);

    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
}

/**
 * Get a complete diary entry by ID
 * @param {string} entryId - The diary entry ID
 * @returns {Promise<Object|null>} - Returns the complete entry or null
 */
export async function getDiaryEntry(entryId) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ENTRIES_STORE], 'readonly');
    const store = transaction.objectStore(ENTRIES_STORE);
    const request = store.get(entryId);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
}

/**
 * Get preview data for all diary entries (for listing/thumbnails)
 * Returns minimal data for efficient loading of entry lists
 * @returns {Promise<Array<{id: string, date: string, timestamp: number, previewImageId: string|null}>>}
 */
export async function getDiaryEntryPreviews() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ENTRIES_STORE], 'readonly');
    const store = transaction.objectStore(ENTRIES_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      const entries = request.result || [];
      
      // Map to preview format
      const previews = entries.map(entry => ({
        id: entry.id,
        date: entry.date,
        timestamp: entry.timestamp,
        previewImageId: entry.imageIds && entry.imageIds.length > 0 ? entry.imageIds[0] : null
      }));
      
      // Sort by timestamp descending (newest first)
      previews.sort((a, b) => b.timestamp - a.timestamp);
      
      resolve(previews);
    };
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
}

/**
 * Get all diary entries (use sparingly - prefer getDiaryEntryPreviews for lists)
 * @returns {Promise<Array>} - Returns array of all entries
 */
export async function getAllDiaryEntries() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ENTRIES_STORE], 'readonly');
    const store = transaction.objectStore(ENTRIES_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      const entries = request.result || [];
      // Sort by timestamp descending (newest first)
      entries.sort((a, b) => b.timestamp - a.timestamp);
      resolve(entries);
    };
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
}

/**
 * Delete a diary entry
 * @param {string} entryId - The entry ID to delete
 * @returns {Promise<void>}
 */
export async function deleteDiaryEntry(entryId) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ENTRIES_STORE], 'readwrite');
    const store = transaction.objectStore(ENTRIES_STORE);
    const request = store.delete(entryId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
}

/**
 * Clear all diary entries (ONLY FOR TESTING/DEBUGGING)
 * @returns {Promise<void>}
 */
export async function clearAllDiaryEntries() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ENTRIES_STORE], 'readwrite');
    const store = transaction.objectStore(ENTRIES_STORE);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
}

// ============================================================================
// LEGACY FUNCTIONS (kept for backward compatibility)
// ============================================================================

// Generate some sample entries for testing
export function generateSampleEntries() {
  const samples = [
    {
      id: '1',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      voiceTranscript: 'Had a wonderful walk in the park today.',
      images: ['/casal-idoso-idosa-velho-e-velha-1651674188773_v2_900x506.jpg'],
      aiGeneratedText: 'What a beautiful day it was yesterday! The sun was shining as I took my morning walk through the park...',
    },
    {
      id: '2',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      voiceTranscript: 'Visited my grandchildren today.',
      images: ['/casal-idoso-idosa-velho-e-velha-1651674188773_v2_900x506.jpg'],
      aiGeneratedText: 'Two days ago, I had the joy of spending time with my grandchildren. Their laughter filled the house...',
    },
    {
      id: '3',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      voiceTranscript: 'Baked cookies with an old recipe.',
      images: [],
      aiGeneratedText: 'Five days ago, I found my grandmother\'s old recipe book and decided to bake her famous cookies...',
    },
    {
      id: '4',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
      voiceTranscript: 'Had coffee with an old friend.',
      images: ['/casal-idoso-idosa-velho-e-velha-1651674188773_v2_900x506.jpg'],
      aiGeneratedText: 'Last week, I reconnected with an old friend over coffee. We reminisced about the good old days...',
    },
    {
      id: '5',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
      voiceTranscript: 'Started reading a new book.',
      images: [],
      aiGeneratedText: 'Two weeks ago, I began reading a fascinating novel that transported me to another world...',
    }
  ];
  return samples;
}
