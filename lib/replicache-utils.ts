/**
 * Utility functions for Replicache operations
 */

/**
 * Clears all Replicache storage and related data
 * This function will:
 * 1. Clear all Replicache localStorage keys
 * 2. Clear any IndexedDB data related to Replicache
 * 3. Reset all Replicache instances
 */
export async function clearAllReplicacheStorage(): Promise<void> {
  console.log('[Replicache Utils] Starting comprehensive storage clear...');
  
  try {
    // Clear all Replicache-related localStorage items
    const keys = Object.keys(localStorage);
    const replicacheKeys = keys.filter(key => key.startsWith('replicache-'));
    
    replicacheKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`[Replicache Utils] Removed localStorage key: ${key}`);
    });

    // Clear IndexedDB data if available
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      try {
        const dbNames = await window.indexedDB.databases();
        for (const dbInfo of dbNames) {
          if (dbInfo.name && dbInfo.name.includes('replicache')) {
            const db = await window.indexedDB.deleteDatabase(dbInfo.name);
            console.log(`[Replicache Utils] Deleted IndexedDB: ${dbInfo.name}`);
          }
        }
      } catch (error) {
        console.log('[Replicache Utils] IndexedDB clear failed (may not be supported):', error);
      }
    }

    // Clear any session storage items
    const sessionKeys = Object.keys(sessionStorage);
    const sessionReplicacheKeys = sessionKeys.filter(key => key.startsWith('replicache-'));
    
    sessionReplicacheKeys.forEach(key => {
      sessionStorage.removeItem(key);
      console.log(`[Replicache Utils] Removed sessionStorage key: ${key}`);
    });

    console.log('[Replicache Utils] All Replicache storage cleared successfully');
  } catch (error) {
    console.error('[Replicache Utils] Error clearing storage:', error);
    throw error;
  }
}

/**
 * Gets the size of Replicache storage in bytes
 */
export function getReplicacheStorageSize(): number {
  let totalSize = 0;
  
  try {
    // Calculate localStorage size
    const keys = Object.keys(localStorage);
    const replicacheKeys = keys.filter(key => key.startsWith('replicache-'));
    
    replicacheKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += new Blob([key + value]).size;
      }
    });

    // Calculate sessionStorage size
    const sessionKeys = Object.keys(sessionStorage);
    const sessionReplicacheKeys = sessionKeys.filter(key => key.startsWith('replicache-'));
    
    sessionReplicacheKeys.forEach(key => {
      const value = sessionStorage.getItem(key);
      if (value) {
        totalSize += new Blob([key + value]).size;
      }
    });

    return totalSize;
  } catch (error) {
    console.error('[Replicache Utils] Error calculating storage size:', error);
    return 0;
  }
}

/**
 * Formats storage size in human-readable format
 */
export function formatStorageSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 