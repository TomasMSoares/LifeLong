/**
 * IndexedDB utility for storing and retrieving images
 * Images are stored as Blobs for efficient storage and retrieval
 */
import imageCompression from 'browser-image-compression';

const DB_NAME = 'LifeLongDB';
const DB_VERSION = 1;
const STORE_NAME = 'images';

/**
 * Initialize and open the IndexedDB database
 * @returns {Promise<IDBDatabase>}
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object store for images if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('entryId', 'entryId', { unique: false });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        objectStore.createIndex('paragraphIndex', 'paragraphIndex', { unique: false });
      }
    };
  });
}

/**
 * Store an image in IndexedDB
 * @param {Blob} imageBlob - The image blob to store
 * @param {string} entryId - Optional diary entry ID to associate with
 * @param {number|null} paragraphIndex - 0-based paragraph index (null if not yet associated)
 * @returns {Promise<string>} - Returns the generated image ID
 */
export async function storeImage(imageBlob, entryId = null, paragraphIndex = null) {
  const db = await openDB();
  const id = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const imageRecord = {
    id,
    blob: imageBlob,
    entryId,
    paragraphIndex, // null = unassociated, 0+ = paragraph position
    timestamp: Date.now(),
    size: imageBlob.size,
    type: imageBlob.type,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(imageRecord);

    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
}

/**
 * Update paragraph association for an image
 * @param {string} imageId - The image ID
 * @param {number|null} paragraphIndex - The paragraph index (null to unassociate)
 * @returns {Promise<void>}
 */
export async function updateImageParagraph(imageId, paragraphIndex) {
  const db = await openDB();

  return new Promise(async (resolve, reject) => {
    try {
      // Get existing image
      const transaction1 = db.transaction([STORE_NAME], 'readonly');
      const store1 = transaction1.objectStore(STORE_NAME);
      const getRequest = store1.get(imageId);

      getRequest.onsuccess = () => {
        const imageRecord = getRequest.result;
        if (!imageRecord) {
          db.close();
          reject(new Error('Image not found'));
          return;
        }

        // Update field
        imageRecord.paragraphIndex = paragraphIndex;

        // Save back
        const transaction2 = db.transaction([STORE_NAME], 'readwrite');
        const store2 = transaction2.objectStore(STORE_NAME);
        const putRequest = store2.put(imageRecord);

        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);

        transaction2.oncomplete = () => db.close();
      };

      getRequest.onerror = () => {
        db.close();
        reject(getRequest.error);
      };
    } catch (err) {
      db.close();
      reject(err);
    }
  });
}

/**
 * Retrieve an image from IndexedDB
 * @param {string} imageId - The image ID to retrieve
 * @returns {Promise<Object|null>} - Returns { id, blob, entryId, paragraphIndex, timestamp, size, type }
 */
export async function getImage(imageId) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(imageId);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
}

/**
 * Get all images associated with a diary entry, sorted by paragraph and display order
 * @param {string} entryId - The diary entry ID
 * @returns {Promise<Array>} - Returns array of image records sorted by paragraphIndex, then timestamp
 */
export async function getImagesByEntryId(entryId) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('entryId');
    const request = index.getAll(entryId);

    request.onsuccess = () => {
      const images = request.result || [];
      // Sort by paragraph index (nulls last), then by timestamp
      images.sort((a, b) => {
        if (a.paragraphIndex === null && b.paragraphIndex === null) {
          return a.timestamp - b.timestamp;
        }
        if (a.paragraphIndex === null) return 1;
        if (b.paragraphIndex === null) return -1;
        if (a.paragraphIndex !== b.paragraphIndex) {
          return a.paragraphIndex - b.paragraphIndex;
        }
        return a.timestamp - b.timestamp;
      });
      resolve(images);
    };
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
}

/**
 * Get all images for a specific paragraph
 * @param {string} entryId - The diary entry ID
 * @param {number} paragraphIndex - The paragraph index
 * @returns {Promise<Array>} - Returns array of image records for that paragraph
 */
export async function getImagesByParagraph(entryId, paragraphIndex) {
  const allImages = await getImagesByEntryId(entryId);
  return allImages.filter(img => img.paragraphIndex === paragraphIndex);
}

/**
 * Delete an image from IndexedDB
 * @param {string} imageId - The image ID to delete
 * @returns {Promise<void>}
 */
export async function deleteImage(imageId) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(imageId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
}

/**
 * Get all images (for debugging/testing)
 * @returns {Promise<Array>} - Returns array of all image records
 */
export async function getAllImages() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
}

/**
 * Create a blob URL from an image ID (for displaying in <img> tags)
 * IMPORTANT: Remember to revoke the URL with URL.revokeObjectURL() when done
 * @param {string} imageId - The image ID
 * @returns {Promise<string|null>} - Returns blob URL or null if not found
 */
export async function getImageUrl(imageId) {
  const imageRecord = await getImage(imageId);
  if (!imageRecord || !imageRecord.blob) {
    return null;
  }
  return URL.createObjectURL(imageRecord.blob);
}

/**
 * Convert image blob to base64 (for LLM API calls)
 * Compresses the image before conversion for optimal API performance
 * @param {string} imageId - The image ID
 * @param {Object} options - Compression options
 * @returns {Promise<string|null>} - Returns base64 string or null if not found
 */
export async function getImageAsBase64(imageId, options = {}) {
  const imageRecord = await getImage(imageId);
  if (!imageRecord || !imageRecord.blob) {
    return null;
  }

  try {
    // Compression options optimized for LLM APIs
    const compressionOptions = {
      maxSizeMB: options.maxSizeMB || 1,
      maxWidthOrHeight: options.maxWidthOrHeight || 1200,
      useWebWorker: true,
      fileType: 'image/jpeg',
      initialQuality: options.quality || 0.85,
    };

    // Compress the image
    const compressedBlob = await imageCompression(imageRecord.blob, compressionOptions);

    // Convert to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(compressedBlob);
    });
  } catch (error) {
    console.error('Compression or conversion error:', error);
    // Fallback: convert original without compression
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(imageRecord.blob);
    });
  }
}

/**
 * Get multiple images as base64 (batch operation for LLM calls)
 * @param {string[]} imageIds - Array of image IDs
 * @param {Object} options - Compression options (passed to getImageAsBase64)
 * @returns {Promise<Array<{id: string, base64: string}>>}
 */
export async function getImagesAsBase64(imageIds, options = {}) {
  const results = await Promise.all(
    imageIds.map(async (id) => {
      const base64 = await getImageAsBase64(id, options);
      return { id, base64 };
    })
  );
  return results.filter(r => r.base64 !== null);
}

/**
 * Clear all images (useful for testing or reset functionality)
 * @returns {Promise<void>}
 */
export async function clearAllImages() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
}
