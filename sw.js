// Service worker minimal, requis pour que l'app soit installable sur mobile.
//
// Stratégie "network-first" : le réseau est toujours privilégié quand il est
// disponible, le cache ne sert que de secours hors-ligne. Volontairement pas
// de mise en cache "au cas où" — c'est ce genre de stratégie qui fait qu'on
// reste coincé sur une ancienne version de l'app après une mise à jour.
const CACHE_NAME = 'eval-profs-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
