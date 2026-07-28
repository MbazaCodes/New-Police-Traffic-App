// TPF Officer Service Worker — v2 (fixed)
// Strategy:
//   API calls (/api/*)         → Network-first, cache fallback (offline JSON)
//   Static assets (/_next/*)  → Cache-first, network fallback
//   Officer pages (/officer/*) → Network-first, cache fallback to shell
//   Everything else            → Network only

const CACHE_VERSION  = "tpf-officer-v2";
const STATIC_CACHE   = `${CACHE_VERSION}-static`;
const API_CACHE      = `${CACHE_VERSION}-api`;

// Pages to pre-cache on install
const APP_SHELL = [
  "/officer/traffic/home",
  "/officer/general/home",
  "/officer/post/home",
];

// ── Install: pre-cache shell pages ────────────────────────────────────
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      Promise.allSettled(APP_SHELL.map((url) => cache.add(url).catch(() => {})))
    )
  );
});

// ── Activate: clean up old caches ─────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("tpf-officer-") && !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: route-based caching strategies ─────────────────────────────
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Skip non-GET requests (POST, PATCH, DELETE go straight to network)
  if (event.request.method !== "GET") return;

  // Skip auth endpoints — never cache
  if (url.pathname.startsWith("/api/auth")) return;

  // ── Strategy 1: API calls — Network-first, JSON fallback ─────────────
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone BEFORE doing anything else with the response
          const clone = response.clone();
          if (response.ok) {
            caches.open(API_CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request).then(
            (cached) =>
              cached ??
              new Response(
                JSON.stringify({ error: "Huna muunganisho wa mtandao", offline: true }),
                { status: 503, headers: { "Content-Type": "application/json" } }
              )
          )
        )
    );
    return;
  }

  // ── Strategy 2: Next.js static assets — Cache-first ──────────────────
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          // Clone BEFORE returning
          const clone = response.clone();
          if (response.ok) {
            caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // ── Strategy 3: Officer pages — Network-first, shell fallback ─────────
  if (url.pathname.startsWith("/officer/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone BEFORE returning
          const clone = response.clone();
          if (response.ok) {
            caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request).then(
            (cached) =>
              cached ??
              caches.match("/officer/traffic/home") ??
              new Response("Offline — reopen when connected", { status: 503 })
          )
        )
    );
    return;
  }

  // ── Default: network only ─────────────────────────────────────────────
  // (Don't intercept — let browser handle normally)
});

// ── Background sync ────────────────────────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-citations") event.waitUntil(syncQueue("tpf-citations-queue", "/api/citations"));
  if (event.tag === "sync-incidents") event.waitUntil(syncQueue("tpf-incidents-queue", "/api/incidents"));
  if (event.tag === "sync-warnings")  event.waitUntil(syncQueue("tpf-warnings-queue",  "/api/warnings"));
});

async function syncQueue(storeName, endpoint) {
  try {
    const cache = await caches.open("tpf-officer-pending");
    const keys  = await cache.keys();
    const queued = keys.filter((k) => k.url.includes(storeName));
    for (const key of queued) {
      const resp = await cache.match(key);
      if (!resp) continue;
      const body = await resp.json();
      try {
        const res = await fetch(endpoint, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(body),
        });
        if (res.ok) await cache.delete(key);
      } catch {
        // Will retry on next sync event
      }
    }
  } catch {
    // Cache not available — ignore
  }
}
