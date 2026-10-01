const CACHE = 'creatina-v4.8';
const ASSETS = ['./', './index.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== CACHE).map((x) => caches.delete(x)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((r) => {
        if (r && r.status === 200) caches.open(CACHE).then((ca) => ca.put(e.request, r.clone()));
        return r;
      }).catch(() => e.request.mode === 'navigate' ? caches.match('./index.html') : null);
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then((clientList) => {
      for (const c of clientList) {
        if (c.url.includes(self.location.origin) && 'focus' in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});
