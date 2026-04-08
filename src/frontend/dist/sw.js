const VERSION = 'v59-2026';
const CACHE_NAME = `apon-foundation-${VERSION}`;
const ICON_CACHE = 'pwa-icon-v1';
const STATIC_ASSETS = ['/', '/index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== ICON_CACHE)
          .map((name) => caches.delete(name))
      )
    ).then(() => {
      // Notify all clients that a new version is active
      return self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
        for (const client of clients) {
          client.postMessage({ type: 'SW_UPDATED', version: VERSION });
        }
      });
    })
  );
  self.clients.claim();
});

// Listen for logo update messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'UPDATE_LOGO' && event.data.logoDataUrl) {
    const dataUrl = event.data.logoDataUrl;
    try {
      // Convert base64 data URL to Blob
      const parts = dataUrl.split(',');
      const mime = parts[0].match(/:(.*?);/)[1];
      const binaryStr = atob(parts[1]);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mime });
      const response = new Response(blob, {
        headers: { 'Content-Type': mime, 'Cache-Control': 'no-cache' }
      });
      caches.open(ICON_CACHE).then((cache) => {
        cache.put('/dynamic-pwa-icon.png', response);
      });
    } catch (e) {
      console.warn('SW: Failed to cache logo:', e);
    }
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Serve dynamic PWA icon from icon cache
  if (event.request.url.endsWith('/dynamic-pwa-icon.png')) {
    event.respondWith(
      caches.open(ICON_CACHE).then((cache) =>
        cache.match('/dynamic-pwa-icon.png').then((cached) => {
          if (cached) return cached;
          // Fallback to static asset
          return caches.open(CACHE_NAME).then((mainCache) =>
            mainCache.match('/assets/generated/pwa-icon-192.dim_192x192.png').then((fallback) => {
              if (fallback) return fallback;
              return fetch('/assets/generated/pwa-icon-192.dim_192x192.png').catch(() => new Response('', { status: 404 }));
            })
          );
        })
      )
    );
    return;
  }

  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') return caches.match('/index.html');
        })
      )
  );
});
