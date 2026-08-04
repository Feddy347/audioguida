const SHELL_CACHE = 'audioguida-shell-v2';
const AUDIO_CACHE = 'audioguida-audio-v1';

const SHELL_FILES = [
  './',
  'index.html',
  'manifest.json',
  'data/experiences.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys
        .filter(k => k !== SHELL_CACHE && k !== AUDIO_CACHE)
        .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Audio + transcript files: cache-first (pre-downloaded)
  if (url.pathname.includes('/audio/') || url.pathname.includes('/scripts/')) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
    return;
  }

  // Shell: stale-while-revalidate
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetched = fetch(e.request).then(response => {
        const clone = response.clone();
        caches.open(SHELL_CACHE).then(cache => cache.put(e.request, clone));
        return response;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
