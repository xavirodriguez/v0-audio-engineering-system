export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  remove(key: string): Promise<void>
  clear(): Promise<void>
}

/**
 * An adapter for the local storage.
 */
export class LocalStorageAdapter implements StorageAdapter {
  /**
   * Gets an item from the local storage.
   * @param {string} key - The key of the item.
   * @returns {Promise<T | null>} - The item.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error("Error reading from localStorage:", error)
      return null
    }
  }

  /**
   * Sets an item in the local storage.
   * @param {string} key - The key of the item.
   * @param {T} value - The value of the item.
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error("Error writing to localStorage:", error)
    }
  }

  /**
   * Removes an item from the local storage.
   * @param {string} key - The key of the item.
   */
  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error("Error removing from localStorage:", error)
    }
  }

  /**
   * Clears the local storage.
   */
  async clear(): Promise<void> {
    try {
      localStorage.clear()
    } catch (error) {
      console.error("Error clearing localStorage:", error)
    }
  }
}

/**
 * An adapter for the IndexedDB.
 */
export class IndexedDBAdapter implements StorageAdapter {
  private dbName = "violin-trainer-db"
  private storeName = "app-data"
  private db: IDBDatabase | null = null

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(request.result)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName)
        }
      }
    })
  }

  /**
   * Gets an item from the IndexedDB.
   * @param {string} key - The key of the item.
   * @returns {Promise<T | null>} - The item.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], "readonly")
        const store = transaction.objectStore(this.storeName)
        const request = store.get(key)

        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result || null)
      })
    } catch (error) {
      console.error("Error reading from IndexedDB:", error)
      return null
    }
  }

  /**
   * Sets an item in the IndexedDB.
   * @param {string} key - The key of the item.
   * @param {T} value - The value of the item.
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], "readwrite")
        const store = transaction.objectStore(this.storeName)
        const request = store.put(value, key)

        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })
    } catch (error) {
      console.error("Error writing to IndexedDB:", error)
    }
  }

  /**
   * Removes an item from the IndexedDB.
   * @param {string} key - The key of the item.
   */
  async remove(key: string): Promise<void> {
    try {
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], "readwrite")
        const store = transaction.objectStore(this.storeName)
        const request = store.delete(key)

        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })
    } catch (error) {
      console.error("Error removing from IndexedDB:", error)
    }
  }

  /**
   * Clears the IndexedDB.
   */
  async clear(): Promise<void> {
    try {
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], "readwrite")
        const store = transaction.objectStore(this.storeName)
        const request = store.clear()

        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })
    } catch (error) {
      console.error("Error clearing IndexedDB:", error)
    }
  }
}

/**
 * Gets the appropriate storage adapter.
 * @returns {StorageAdapter} - The storage adapter.
 */
export const getStorageAdapter = (): StorageAdapter => {
  // Use IndexedDB for better support of Blobs and large data
  if (typeof window !== "undefined" && "indexedDB" in window) {
    return new IndexedDBAdapter()
  }
  // Fallback to localStorage
  return new LocalStorageAdapter()
}
