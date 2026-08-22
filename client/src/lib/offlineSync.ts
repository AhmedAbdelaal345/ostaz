const STORAGE_KEY = "ostazi-offline-trpc-queue-v1";

type QueuedRequest = {
  id: string;
  url: string;
  body: BodyInit | null | undefined;
  headers: Record<string, string>;
  createdAt: number;
};

function readQueue(): QueuedRequest[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

function writeQueue(queue: QueuedRequest[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  window.dispatchEvent(new Event("ostazi-offline-queue-change"));
}

export function offlineQueueSize() { return readQueue().length; }

export function enqueueTrpcRequest(url: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  const queue = readQueue();
  queue.push({
    id: crypto.randomUUID(),
    url,
    body: typeof init?.body === "string" ? init.body : null,
    headers: Object.fromEntries(headers.entries()),
    createdAt: Date.now(),
  });
  writeQueue(queue);
}

export async function flushOfflineQueue() {
  if (!navigator.onLine) return { sent: 0, pending: offlineQueueSize() };
  const queue = readQueue();
  let sent = 0;
  const remaining: QueuedRequest[] = [];
  for (const request of queue) {
    try {
      const response = await fetch(request.url, { method: "POST", headers: request.headers, body: request.body, credentials: "include" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      sent += 1;
    } catch {
      remaining.push(request);
    }
  }
  writeQueue(remaining);
  return { sent, pending: remaining.length };
}
