// ============================================================
// OFFLINE SYNC ENGINE — IndexedDB queue + auto-sync
// Persists form data when offline, syncs when online
// ============================================================

export type SyncQueueItem = {
  id: string;
  endpoint: string;
  payload: Record<string, unknown>;
  method: "POST" | "PATCH" | "PUT" | "DELETE";
  createdAt: string;
  retries?: number;
  lastError?: string;
};

export type SyncStatus = {
  pending: number;
  lastSynced: string | null;
  isOnline: boolean;
  isSyncing: boolean;
};

const DB_NAME = "tz-police-offline";
const QUEUE_STORE = "sync_queue";
const STATUS_STORE = "sync_status";

let syncInProgress = false;
let statusListeners: ((status: SyncStatus) => void)[] = [];
let currentStatus: SyncStatus = {
  pending: 0,
  lastSynced: null,
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  isSyncing: false,
};

// ---- IndexedDB helpers ----

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 2);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STATUS_STORE)) {
        db.createObjectStore(STATUS_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ---- Queue operations ----

export async function queueSyncItem(item: SyncQueueItem): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, "readwrite");
    tx.objectStore(QUEUE_STORE).put({
      ...item,
      createdAt: item.createdAt || new Date().toISOString(),
      retries: 0,
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  
  // Update status
  await updatePendingCount();
  
  // Try to sync immediately if online
  if (navigator.onLine) {
    processSyncQueue();
  }
}

export async function readSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, "readonly");
    const req = tx.objectStore(QUEUE_STORE).getAll();
    req.onsuccess = () => resolve((req.result ?? []) as SyncQueueItem[]);
    req.onerror = () => reject(req.error);
  });
}

export async function removeSyncItem(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, "readwrite");
    tx.objectStore(QUEUE_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  
  await updatePendingCount();
}

// ---- Status tracking ----

async function updatePendingCount(): Promise<void> {
  try {
    const items = await readSyncQueue();
    currentStatus.pending = items.length;
    notifyListeners();
  } catch (e) {
    console.error("Failed to update pending count:", e);
  }
}

function notifyListeners(): void {
  statusListeners.forEach(listener => listener({ ...currentStatus }));
}

export function subscribeToSyncStatus(listener: (status: SyncStatus) => void): () => void {
  statusListeners.push(listener);
  listener({ ...currentStatus });
  // Return unsubscribe function
  return () => {
    statusListeners = statusListeners.filter(l => l !== listener);
  };
}

export async function getSyncStatus(): Promise<SyncStatus> {
  await updatePendingCount();
  return { ...currentStatus };
}

export async function saveLastSyncTime(time: string): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STATUS_STORE, "readwrite");
      tx.objectStore(STATUS_STORE).put({ id: "last_synced", value: time });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    currentStatus.lastSynced = time;
    notifyListeners();
  } catch (e) {
    console.error("Failed to save last sync time:", e);
  }
}

// ---- Core sync engine ----

export async function processSyncQueue(): Promise<{ success: number; failed: number }> {
  if (syncInProgress || !navigator.onLine) {
    return { success: 0, failed: 0 };
  }

  syncInProgress = true;
  currentStatus.isSyncing = true;
  notifyListeners();

  let success = 0;
  let failed = 0;

  try {
    const items = await readSyncQueue();
    
    for (const item of items) {
      const shouldRetry = (item.retries || 0) < 3;
      
      try {
        const response = await fetch(item.endpoint, {
          method: item.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item.payload),
        });

        if (response.ok) {
          // Success - remove from queue
          await removeSyncItem(item.id);
          success++;
          console.log(`[OfflineSync] ✅ Synced: ${item.endpoint} (${item.id})`);
        } else if (shouldRetry) {
          // Server error - retry later
          await updateRetryCount(item.id, item.retries || 0, await response.text());
          failed++;
        } else {
          // Max retries reached - keep in queue but mark
          await updateRetryCount(item.id, 3, "Max retries reached");
          failed++;
        }
      } catch (error) {
        // Network error - retry later if under limit
        if (shouldRetry) {
          await updateRetryCount(item.id, item.retries || 0, String(error));
        }
        failed++;
        console.error(`[OfflineSync] ❌ Failed: ${item.endpoint}`, error);
      }
    }

    // Update last synced time if we had successes
    if (success > 0) {
      await saveLastSyncTime(new Date().toISOString());
    }
  } catch (e) {
    console.error("[OfflineSync] Queue processing error:", e);
  } finally {
    syncInProgress = false;
    currentStatus.isSyncing = false;
    notifyListeners();
  }

  return { success, failed };
}

async function updateRetryCount(id: string, currentRetries: number, error: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, "readwrite");
    const store = tx.objectStore(QUEUE_STORE);
    const item = store.get(id);
    item.onsuccess = () => {
      const data = item.result;
      if (data) {
        data.retries = currentRetries + 1;
        data.lastError = error.slice(0, 200); // Truncate long errors
        store.put(data);
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ---- Auto-sync on connectivity change ----

let syncInitializer = false;

export function initAutoSync(): void {
  if (typeof window === "undefined" || syncInitializer) return;
  syncInitializer = true;

  // Update online status
  const updateOnlineStatus = () => {
    currentStatus.isOnline = navigator.onLine;
    notifyListeners();
    
    if (navigator.onLine) {
      console.log("[OfflineSync] 🌐 Back online - starting sync...");
      processSyncQueue();
    } else {
      console.log("[OfflineSync] 📴 Offline - queuing requests locally");
    }
  };

  // Listen for connectivity changes
  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);

  // Initial status
  updateOnlineStatus();

  // Also try syncing every 30 seconds when online (for missed events)
  setInterval(() => {
    if (navigator.onLine && !syncInProgress) {
      readSyncQueue().then(items => {
        if (items.length > 0) {
          processSyncQueue();
        }
      }).catch(() => {});
    }
  }, 30000);

  // Load initial pending count
  updatePendingCount();
}

// ---- Helper: Save with offline support ----

export async function saveWithOfflineSupport(
  endpoint: string,
  payload: Record<string, unknown>,
  method: "POST" | "PATCH" | "PUT" | "DELETE" = "POST"
): Promise<{ ok: boolean; data?: any; fromCache: boolean }> {
  const itemId = `${method}-${endpoint}-${Date.now()}`;

  // Try direct API call first if online
  if (navigator.onLine) {
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        return { ok: true, data, fromCache: false };
      }
      
      // API error - still queue for potential retry
      console.warn(`[OfflineSync] API returned ${response.status}, queuing anyway`);
    } catch (error) {
      console.log("[OfflineSync] Network error, saving to local queue");
    }
  }

  // Queue for offline sync
  await queueSyncItem({
    id: itemId,
    endpoint,
    payload,
    method,
    createdAt: new Date().toISOString(),
  });

  return { 
    ok: true, 
    data: { id: itemId, cached: true }, 
    fromCache: true 
  };
}

// ---- Clear all queued items (for testing/admin) ----

export async function clearSyncQueue(): Promise<number> {
  const db = await openDb();
  const items = await readSyncQueue();
  
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, "readwrite");
    const store = tx.objectStore(QUEUE_STORE);
    store.clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  await updatePendingCount();
  return items.length;
}
