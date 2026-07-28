// TPF Digital Platform — Service Worker
const CACHE_NAME = 'tpf-digital-v2';
const OFFLINE_URL = '/offline';

const STATIC_ASSETS = [
  '/',
  '/citizen',
  '/login',
  '/police-logo.png',
  '/manifest.json',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - API calls: network first, no cache
// - Static assets: cache first
// - Pages: network first, fall back to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin
  if (request.method !== 'GET' || url.origin !== location.origin) return;

  // API calls — always network, never cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => new Response(JSON.stringify({ error: 'Offline' }), {
        status: 503, headers: { 'Content-Type': 'application/json' }
      }))
    );
    return;
  }

  // Next.js static chunks — cache first (immutable)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return res;
      }))
    );
    return;
  }

  // Pages — network first, fall back to cache
  event.respondWith(
    fetch(request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return res;
      })
      .catch(() => caches.match(request).then(cached => cached || caches.match('/')))
  );
});

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || 'TPF Digital';
  const options = {
    body: data.body || 'Taarifa mpya',
    icon: '/police-logo.png',
    badge: '/police-logo.png',
    tag: data.tag || 'tpf-notification',
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200],
    requireInteraction: data.urgent || false,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      const client = windowClients.find(c => c.url === url && 'focus' in c);
      if (client) return client.focus();
      return clients.openWindow(url);
    })
  );
});
