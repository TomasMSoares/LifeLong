/**
 * IndexedDB storage for diary entries
 * Stores complete diary entries with audio, transcript, and LLM-generated content
 */

const DB_NAME = 'LifeLongDB';
const DB_VERSION = 3; // Incremented to add entries store
const ENTRIES_STORE = 'entries';

/**
 * Open the IndexedDB database and create stores if needed
 * @returns {Promise<IDBDatabase>}
 */
function openDB() {
  console.log('[storage] Opening IndexedDB...');
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[storage] IndexedDB open error:', request.error);
      reject(request.error);
    };
    request.onsuccess = () => {
      console.log('[storage] IndexedDB opened successfully');
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      console.log('[storage] IndexedDB upgrade needed, creating stores...');
      const db = event.target.result;
      
      // Create entries store if it doesn't exist
      if (!db.objectStoreNames.contains(ENTRIES_STORE)) {
        console.log('[storage] Creating entries store');
        const entriesStore = db.createObjectStore(ENTRIES_STORE, { keyPath: 'id' });
        entriesStore.createIndex('date', 'date', { unique: false });
        entriesStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      // Create images store if it doesn't exist (shared with imageDB.js)
      if (!db.objectStoreNames.contains('images')) {
        console.log('[storage] Creating images store for imageDB compatibility');
        const imagesStore = db.createObjectStore('images', { keyPath: 'id' });
        imagesStore.createIndex('entryId', 'entryId', { unique: false });
        imagesStore.createIndex('timestamp', 'timestamp', { unique: false });
        imagesStore.createIndex('paragraphIndex', 'paragraphIndex', { unique: false });
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
      imageParagraphMapping: entryData.imageParagraphMapping || {},
      imageDescriptions: entryData.imageDescriptions || {}
    },
    imageIds: entryData.imageIds || [],
    userName: entryData.userName || 'they',
  };

  console.log('Saving diary entry:', entry);

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
  console.log('[storage] getAllDiaryEntries called');
  
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ENTRIES_STORE], 'readonly');
      const store = transaction.objectStore(ENTRIES_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const entries = request.result || [];
        console.log('[storage] getAllDiaryEntries - raw entries:', entries);
        // Sort by timestamp descending (newest first)
        entries.sort((a, b) => b.timestamp - a.timestamp);
        console.log('[storage] getAllDiaryEntries - sorted entries:', entries);
        resolve(entries);
      };
      request.onerror = () => {
        console.error('[storage] getAllDiaryEntries error:', request.error);
        // Resolve with empty array instead of rejecting to prevent app crashes
        resolve([]);
      };

      transaction.oncomplete = () => db.close();
      transaction.onerror = () => {
        console.error('[storage] getAllDiaryEntries transaction error');
        db.close();
        // Resolve with empty array instead of rejecting
        resolve([]);
      };
    });
  } catch (error) {
    console.error('[storage] getAllDiaryEntries catch error:', error);
    // Return empty array on any error to prevent crashes
    return [];
  }
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
      timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
      transcript: 'Had a wonderful walk in the park today.',
      audioBlob: null,
      llmResponse: {
        paragraphs: ['What a beautiful day it was yesterday! The sun was shining as I took my morning walk through the park...'],
        imageParagraphMapping: { 'sample-img-1': 0 },
        imageDescriptions: { 'sample-img-1': 'A peaceful park scene' }
      },
      imageIds: ['sample-img-1'],
      userName: 'they',
    },
    {
      id: '2',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
      transcript: 'Visited my grandchildren today.',
      audioBlob: null,
      llmResponse: {
        paragraphs: ['Two days ago, I had the joy of spending time with my grandchildren. Their laughter filled the house...'],
        imageParagraphMapping: { 'sample-img-2': 0 },
        imageDescriptions: { 'sample-img-2': 'Time with grandchildren' }
      },
      imageIds: ['sample-img-2'],
      userName: 'they',
    },
    {
      id: '3',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
      transcript: 'Baked cookies with an old recipe.',
      audioBlob: null,
      llmResponse: {
        paragraphs: ['Five days ago, I found my grandmother\'s old recipe book and decided to bake her famous cookies...'],
        imageParagraphMapping: {},
        imageDescriptions: {}
      },
      imageIds: [],
      userName: 'they',
    },
    {
      id: '4',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
      timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
      transcript: 'Had coffee with an old friend.',
      audioBlob: null,
      llmResponse: {
        paragraphs: ['Last week, I reconnected with an old friend over coffee. We reminisced about the good old days...'],
        imageParagraphMapping: { 'sample-img-4': 0 },
        imageDescriptions: { 'sample-img-4': 'Coffee with a friend' }
      },
      imageIds: ['sample-img-4'],
      userName: 'they',
    },
    {
      id: '5',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
      timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000,
      transcript: 'Started reading a new book.',
      audioBlob: null,
      llmResponse: {
        paragraphs: ['Two weeks ago, I began reading a fascinating novel that transported me to another world...'],
        imageParagraphMapping: {},
        imageDescriptions: {}
      },
      imageIds: [],
      userName: 'they',
    }
  ];
  return samples;
}

/**
 * Populate database with sample entries (for testing/demo)
 * Only adds samples if database is empty to prevent duplicate key errors
 * @param {Array} samples - Array of sample entries from generateSampleEntries()
 * @returns {Promise<void>}
 */
export async function populateDatabaseWithSamples() {
  console.log('[storage] populateDatabaseWithSamples called');
  const db = await openDB();

  return new Promise((resolve, reject) => {
    // First check if database already has entries
    const checkTransaction = db.transaction([ENTRIES_STORE], 'readonly');
    const checkStore = checkTransaction.objectStore(ENTRIES_STORE);
    const countRequest = checkStore.count();

    countRequest.onsuccess = () => {
      const count = countRequest.result;
      console.log('[storage] Current entry count:', count);
      
      if (count > 0) {
        console.log('[storage] Database already has entries, skipping sample population');
        db.close();
        resolve();
        return;
      }

      // Database is empty, add samples
      const samples = generateSampleEntries();
      console.log('[storage] Generated sample entries:', samples);

      const transaction = db.transaction([ENTRIES_STORE], 'readwrite');
      const store = transaction.objectStore(ENTRIES_STORE);
      
      // Add each sample entry
      samples.forEach(sample => {
        console.log('[storage] Adding sample entry:', sample);
        store.add(sample);
      });

      transaction.oncomplete = () => {
        console.log('[storage] Sample entries added successfully');
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        console.error('[storage] populateDatabaseWithSamples error:', transaction.error);
        db.close();
        reject(transaction.error);
      };
    };

    countRequest.onerror = () => {
      console.error('[storage] Error checking entry count:', countRequest.error);
      db.close();
      reject(countRequest.error);
    };
  });
}