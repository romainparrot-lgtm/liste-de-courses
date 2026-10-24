const VERSION = 'courses-v7';
const FILES = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'fond.jpg'];
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
