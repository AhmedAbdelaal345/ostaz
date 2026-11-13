const CACHE_PREFIX = "el-mister-";
const CACHE = `${CACHE_PREFIX}v17`;
const BRAND_ICON = "/manus-storage/el-mister-icon-192_c406f989.png";
const APP_SHELL = ["/", "/manifest.json", BRAND_ICON];

function isApiRequest(request) {
  const url = new URL(request.url);
  return url.origin === self.location.origin && (url.pathname === "/api" || url.pathname.startsWith("/api/"));
}

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(APP_SHELL).catch(() => undefined);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") event.waitUntil(self.skipWaiting());
});

self.addEventListener("fetch", event => {
  const request = event.request;

  // Leave all API traffic to the browser's normal network path. In particular,
  // never match it from Cache Storage or send it through the SPA shell fallback.
  if (isApiRequest(request)) return;
  if (new URL(request.url).origin !== self.location.origin) return;
  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok && response.headers.get("content-type")?.includes("text/html")) {
          const cache = await caches.open(CACHE);
          await cache.put("/", response.clone());
        }
        return response;
      } catch {
        const cache = await caches.open(CACHE);
        return (await cache.match("/")) || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch {
      return Response.error();
    }
  })());
});

self.addEventListener("push", event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    try { data = { body: event.data?.text?.() || "" }; } catch { data = {}; }
  }
  const title = data.title || "El Mister | المستر";
  const options = {
    body: data.body || "لديك تحديث جديد",
    icon: BRAND_ICON,
    badge: BRAND_ICON,
    tag: data.tag || `el-mister-${Date.now()}`,
    renotify: true,
    requireInteraction: true,
    data: { url: data.url || "/" },
    dir: data.lang === "en" ? "ltr" : "rtl",
    lang: data.lang || "ar",
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(items => {
    const target = event.notification.data?.url || "/";
    const existing = items.find(client => client.url.includes(target));
    return existing ? existing.focus() : self.clients.openWindow(target);
  }));
});
