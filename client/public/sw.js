const CACHE = 'ostazi-shell-v1';
const APP_SHELL = ['/', '/manifest.json'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL))); self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', event => { if (event.request.method !== 'GET') return; event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); return response; }).catch(() => caches.match('/'))); });
self.addEventListener('push', event => { const data = event.data ? event.data.json() : {}; const title = data.title || 'أستاذي'; const options = { body: data.body || 'لديك تحديث جديد', icon: '/favicon.svg', badge: '/favicon.svg', data: { url: data.url || '/' }, dir: 'rtl', lang: 'ar' }; event.waitUntil(self.registration.showNotification(title, options)); });
self.addEventListener('notificationclick', event => { event.notification.close(); event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(items => { const target = event.notification.data?.url || '/'; const existing = items.find(client => client.url.includes(target)); return existing ? existing.focus() : clients.openWindow(target); })); });
