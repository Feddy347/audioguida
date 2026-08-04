const SHELL_CACHE = 'audioguida-shell-v1';
const AUDIO_CACHE = 'audioguida-audio-v1';

const SHELL_FILES = [
  './',
  'index.html',
  'manifest.json',
  'data/experiences.json'
];

// Install: cache app shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
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

// Fetch: cache-first for shell and audio, network-first for everything else
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Audio files: cache-first (pre-downloaded via the download button)
  if (url.pathname.includes('/audio/')) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
    return;
  }

  // Shell files: cache-first, fallback to network
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
