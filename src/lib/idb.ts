/**
 * Native IndexedDB wrapper for unlimited, permanent lifetime storage in the browser.
 * IndexedDB has gigabytes of storage capacity, eliminating localStorage's ~5MB quota limit,
 * ensuring hundreds of high-resolution photos, certificates, and projects are permanently preserved.
 */

const DB_NAME = 'SubaithalPortfolioDB';
const DB_VERSION = 1;
const STORE_NAME = 'portfolio_store';
const KEY_DATA = 'full_portfolio_data';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function getIdbItem<T>(key: string = KEY_DATA): Promise<T | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve((request.result as T) || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.warn('IndexedDB read failed:', err);
    return null;
  }
}

export async function setIdbItem<T>(key: string = KEY_DATA, value: T): Promise<boolean> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.warn('IndexedDB write failed:', err);
    return false;
  }
}
