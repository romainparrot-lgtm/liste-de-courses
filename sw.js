const VERSION = 'courses-v18';
const FILES = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'fond.jpg', 'fond-depenses.jpg'];
const IMAGES = ['rayon-fruits-et-legumes', 'rayon-boulangerie', 'rayon-frais', 'rayon-viandes-et-poissons', 'rayon-epicerie', 'rayon-boissons', 'rayon-surgeles', 'rayon-maison-et-hygiene', 'rayon-autre'].map(n => 'images/' + n + '.jpg');

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION).then(c =>
      c.addAll(FILES).then(() => Promise.all(IMAGES.map(u => c.add(u).catch(() => {}))))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        if (r.ok) {
          const copy = r.clone();
          caches.open(VERSION).then(c => c.put(e.request, copy));
        }
        return r;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./')))
  );
});

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data.json(); } catch (x) {}
  e.waitUntil(self.registration.showNotification(d.title || 'Courses', {
    body: d.body || 'La liste a été mise à jour',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: 'courses',
    renotify: true
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontained: true }).then(l => l.length ? l[0].focus() : clients.openWindow('./'))
  );
});
