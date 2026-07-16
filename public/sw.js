// TZ Police PWA Service Worker
// Provides offline caching for app shell and API responses

const CACHE_NAME = "tz-police-v1";
const APP_SHELL = [
  "/",
  "/police-logo.png",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip Next.js internals
  if (request.url.includes("/_next/")) return;

  // Network-first for API requests, cache-first for static
  if (request.url.includes("/api/")) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request) as Promise<Response>)
    );
  } else {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          })
      )
    );
  }
});
