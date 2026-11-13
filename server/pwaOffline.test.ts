import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";

type WorkerEvent = {
  request?: { url: string; method: string; mode: string; destination?: string };
  data?: { type?: string };
  notification?: { close: () => void; data?: { url?: string } };
  respondWith?: (response: Promise<Response> | Response) => void;
  waitUntil?: (promise: Promise<unknown>) => void;
};

function createWorker(cacheNames: string[] = []) {
  const listeners = new Map<string, (event: WorkerEvent) => void>();
  const entries = new Map<string, Response>();
  const cache = {
    addAll: vi.fn(async () => undefined),
    match: vi.fn(async (request: string | { url: string }) => entries.get(typeof request === "string" ? request : request.url)),
    put: vi.fn(async (request: string | { url: string }, response: Response) => {
      entries.set(typeof request === "string" ? request : request.url, response);
    }),
  };
  const cachesApi = {
    open: vi.fn(async () => cache),
    keys: vi.fn(async () => cacheNames),
    delete: vi.fn(async (_key: string) => true),
  };
  const fetchMock = vi.fn(async (_request: unknown) => new Response("network", { status: 200 }));
  const selfApi = {
    location: new URL("https://ostaz-one.vercel.app/sw.js"),
    clients: { claim: vi.fn(async () => undefined), matchAll: vi.fn(async () => []), openWindow: vi.fn() },
    registration: { showNotification: vi.fn() },
    skipWaiting: vi.fn(async () => undefined),
    addEventListener: (type: string, listener: (event: WorkerEvent) => void) => listeners.set(type, listener),
  };

  const source = readFileSync(resolve(process.cwd(), "client/public/sw.js"), "utf8");
  runInNewContext(source, { self: selfApi, caches: cachesApi, fetch: fetchMock, Response, URL, Date, Promise });

  return {
    cache,
    caches: cachesApi,
    dispatch(type: string, event: WorkerEvent = {}) {
      const waits: Promise<unknown>[] = [];
      const responses: Promise<Response>[] = [];
      event.waitUntil = promise => waits.push(Promise.resolve(promise));
      event.respondWith = response => responses.push(Promise.resolve(response));
      listeners.get(type)?.(event);
      return { waits, responses };
    },
    fetch: fetchMock,
    self: selfApi,
  };
}

describe("PWA worker request and update lifecycle", () => {
  it("leaves /api and /api/* requests to the network without cache or SPA fallback", () => {
    const worker = createWorker();
    for (const url of [
      "https://ostaz-one.vercel.app/api",
      "https://ostaz-one.vercel.app/api/trpc/auth.me?input=%7B%7D",
    ]) {
      const result = worker.dispatch("fetch", { request: { url, method: "GET", mode: "navigate" } });
      expect(result.responses).toHaveLength(0);
    }
    expect(worker.caches.open).not.toHaveBeenCalled();
    expect(worker.fetch).not.toHaveBeenCalled();
  });

  it("keeps login, register, logout, and auth.me on the network for repeated cycles", () => {
    const worker = createWorker();
    const base = "https://ostaz-one.vercel.app/api/trpc/";
    for (let cycle = 0; cycle < 3; cycle += 1) {
      for (const procedure of ["teacherAuth.login", "teacherAuth.register", "auth.me", "auth.logout", "teacherAuth.login", "auth.me"]) {
        const result = worker.dispatch("fetch", {
          request: { url: `${base}${procedure}`, method: procedure === "auth.me" ? "GET" : "POST", mode: "cors" },
        });
        expect(result.responses).toHaveLength(0);
      }
    }
    expect(worker.caches.open).not.toHaveBeenCalled();
    expect(worker.fetch).not.toHaveBeenCalled();
  });

  it("does not send nested API navigation requests through the app-shell fallback", () => {
    const worker = createWorker();
    const result = worker.dispatch("fetch", {
      request: { url: "https://ostaz-one.vercel.app/api/trpc/auth.me", method: "GET", mode: "navigate", destination: "document" },
    });
    expect(result.responses).toHaveLength(0);
    expect(worker.cache.match).not.toHaveBeenCalled();
  });

  it("keeps Vercel API rewrites and no-store headers separate from the SPA fallback", () => {
    const config = JSON.parse(readFileSync(resolve(process.cwd(), "vercel.json"), "utf8"));
    expect(config.rewrites[0]).toMatchObject({
      source: "/api/:path*",
      destination: "/api/handler?__vercel_path=:path*",
    });
    expect(config.rewrites[1].source).toContain("(?!api(?:/|$))");
    for (const path of ["/api", "/api/:path*"]) {
      const rule = config.headers.find((entry: { source: string }) => entry.source === path);
      expect(rule?.headers).toContainEqual({
        key: "Cache-Control",
        value: "no-store, max-age=0, must-revalidate",
      });
    }
  });

  it("removes only obsolete El Mister caches during activation", async () => {
    const worker = createWorker(["el-mister-v16", "el-mister-v12", "another-app-cache"]);
    const activation = worker.dispatch("activate");
    await Promise.all(activation.waits);
    expect(worker.caches.delete.mock.calls.map(([key]) => key)).toEqual(["el-mister-v16", "el-mister-v12"]);
    expect(worker.self.clients.claim).toHaveBeenCalledOnce();
  });

  it("uses the new app shell after a network navigation and on offline fallback", async () => {
    const worker = createWorker();
    worker.fetch.mockResolvedValueOnce(new Response("<html>new shell</html>", {
      headers: { "content-type": "text/html" },
    }));
    const online = worker.dispatch("fetch", {
      request: { url: "https://ostaz-one.vercel.app/groups", method: "GET", mode: "navigate", destination: "document" },
    });
    const onlineResponse = await online.responses[0];
    expect(await onlineResponse.text()).toContain("new shell");
    expect(worker.cache.put).toHaveBeenCalledWith("/", expect.any(Response));

    worker.fetch.mockRejectedValueOnce(new Error("offline"));
    const offline = worker.dispatch("fetch", {
      request: { url: "https://ostaz-one.vercel.app/groups", method: "GET", mode: "navigate", destination: "document" },
    });
    const offlineResponse = await offline.responses[0];
    expect(await offlineResponse.text()).toContain("new shell");
  });

  it("activates updates promptly, versions its own cache, and keeps push handling", () => {
    const worker = createWorker();
    const install = worker.dispatch("install");
    expect(install.waits).toHaveLength(1);
    expect(worker.self.skipWaiting).not.toHaveBeenCalled();
    return Promise.all(install.waits).then(() => {
      expect(worker.self.skipWaiting).toHaveBeenCalledOnce();
      expect(worker.cache.addAll).toHaveBeenCalledWith(expect.arrayContaining(["/", "/manifest.json"]));
      expect(readFileSync(resolve(process.cwd(), "client/public/sw.js"), "utf8")).toContain('const CACHE = `${CACHE_PREFIX}v18`');
      const entry = readFileSync(resolve(process.cwd(), "client/src/main.tsx"), "utf8");
      expect(entry).toContain('registration.addEventListener("updatefound"');
      expect(entry).toContain('registration.waiting?.postMessage({ type: "SKIP_WAITING" })');
      expect(entry).toContain('navigator.serviceWorker.addEventListener("controllerchange"');
      expect(entry).not.toContain("getRegistrations().then(registrations => Promise.all(registrations.map(registration => registration.unregister())));");
      expect(readFileSync(resolve(process.cwd(), "vercel.json"), "utf8")).toContain('"source": "/sw.js"');
      expect(readFileSync(resolve(process.cwd(), "client/public/sw.js"), "utf8")).toContain('self.addEventListener("push"');
    });
  });

  it("retains offline sync, reminder delivery, and network auth refresh behavior", () => {
    const entry = readFileSync(resolve(process.cwd(), "client/src/main.tsx"), "utf8");
    expect(entry).toContain('staleTime: 0, refetchOnMount: "always"');
    expect(entry).toContain("enqueueTrpcRequest(String(scoped.input), scoped.init)");
    const offlineRuntime = readFileSync(resolve(process.cwd(), "client/src/components/OfflineRuntime.tsx"), "utf8");
    expect(offlineRuntime).toContain("تمت استعادة الاتصال");
    expect(offlineRuntime).toContain("result.sent");
    expect(offlineRuntime).toContain("if (navigator.onLine && offlineQueueSize()) void sync()");
    const reminders = readFileSync(resolve(process.cwd(), "client/src/components/PersonalRemindersPanel.tsx"), "utf8");
    expect(reminders).not.toContain("setTimeout");
    expect(reminders).not.toContain("setInterval");
    const scheduled = readFileSync(resolve(process.cwd(), "server/scheduledPersonalReminders.ts"), "utf8");
    expect(scheduled).toContain("sendPushToUser");
    expect(scheduled).toContain("claimPersonalReminderDelivery");
  });
});
