const CACHE = "el-mister-shell-v8";
const CACHE = "el-mister-v11";
const BRAND_ICON = "/manus-storage/el-mister-icon-192_c406f989.png";
const APP_SHELL = ["/", "/manifest.json", BRAND_ICON];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)).catch(() => undefined));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request);
        const cache = await caches.open(CACHE);
        await cache.put("/", response.clone());
        return response;
      } catch {
        return (await caches.match("/")) || Response.error();
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok && new URL(event.request.url).origin === self.location.origin) {
        const cache = await caches.open(CACHE);
        await cache.put(event.request, response.clone());
      }
      return response;
    } catch {
      return (await caches.match("/")) || Response.error();
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
