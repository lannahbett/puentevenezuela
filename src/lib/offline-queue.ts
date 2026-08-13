// Offline-first queue for reports created with a bad or missing connection.
// Reports are stored in localStorage and flushed automatically once the
// browser reports connectivity again.

export interface QueuedReport {
  localId: string;
  createdAt: number;
  attempts: number;
  payload: {
    type: "need" | "offer";
    category: string;
    title: string;
    description?: string;
    latitude: number;
    longitude: number;
    location_name?: string;
    contact_phone?: string;
    urgency: number;
    country: "VE" | "CO";
  };
}

const KEY = "puente.offlineQueue.v1";
const listeners = new Set<(q: QueuedReport[]) => void>();

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getQueue(): QueuedReport[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as QueuedReport[]) : [];
  } catch {
    return [];
  }
}

function setQueue(q: QueuedReport[]) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(q));
  } catch {
    // storage full / private mode — ignore
  }
  listeners.forEach((fn) => fn(q));
}

export function subscribeQueue(fn: (q: QueuedReport[]) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function enqueueReport(payload: QueuedReport["payload"]): QueuedReport {
  const item: QueuedReport = {
    localId:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: Date.now(),
    attempts: 0,
    payload,
  };
  setQueue([...getQueue(), item]);
  return item;
}

export function removeQueued(localId: string) {
  setQueue(getQueue().filter((i) => i.localId !== localId));
}

let flushing = false;

/**
 * Try to send every queued report. Items that fail stay in the queue for the
 * next attempt. Returns how many reports were synced.
 */
export async function flushQueue(
  send: (payload: QueuedReport["payload"]) => Promise<unknown>,
): Promise<number> {
  if (!isBrowser() || flushing) return 0;
  if (!navigator.onLine) return 0;
  const queue = getQueue();
  if (queue.length === 0) return 0;

  flushing = true;
  let synced = 0;
  try {
    for (const item of queue) {
      try {
        await send(item.payload);
        removeQueued(item.localId);
        synced++;
      } catch {
        setQueue(
          getQueue().map((i) =>
            i.localId === item.localId ? { ...i, attempts: i.attempts + 1 } : i,
          ),
        );
        break; // still offline / server down — retry later
      }
    }
  } finally {
    flushing = false;
  }
  return synced;
}
