// TPF Citizen Service Worker — v1
// Strategy:
//   API calls (/api/citizen-portal/*) → Network-first, cache fallback (offline JSON)
//   Static assets (/_next/*)          → Cache-first, network fallback
//   Citizen pages (/citizen/*)        → Network-first, cache fallback to shell
//   Auth endpoints (/api/auth/*)      → Skip (never cache)
//   Everything else                   → Network only

const CACHE_VERSION  = "tpf-citizen-v1";
const STATIC_CACHE   = `${CACHE_VERSION}-static`;
const API_CACHE      = `${CACHE_VERSION}-api`;

// Pages to pre-cache on install
const APP_SHELL = [
  "/citizen/dashboard",
  "/citizen/reports",
  "/citizen/payments",
  "/citizen/complaints",
  "/citizen/profile",
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
          .filter((k) => k.startsWith("tpf-citizen-") && !k.startsWith(CACHE_VERSION))
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

  // ── Strategy 1: Citizen API — Network-first, JSON fallback ────────────
  if (url.pathname.startsWith("/api/citizen-portal")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
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

  // ── Strategy 3: Citizen pages — Network-first, shell fallback ─────────
  if (url.pathname.startsWith("/citizen/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
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
              caches.match("/citizen/dashboard") ??
              new Response("Offline — fungua tena ukiwa na mtandao", { status: 503 })
          )
        )
    );
    return;
  }

  // ── Default: network only ─────────────────────────────────────────────
});

// ── Background sync for citizen data ──────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-citizen-complaints") event.waitUntil(syncQueue("tpf-citizen-complaints", "/api/citizen-portal"));
  if (event.tag === "sync-citizen-applications") event.waitUntil(syncQueue("tpf-citizen-applications", "/api/citizen-portal"));
});

async function syncQueue(storeName, endpointBase) {
  try {
    const cache = await caches.open("tpf-citizen-pending");
    const keys  = await cache.keys();
    const queued = keys.filter((k) => k.url.includes(storeName));
    for (const key of queued) {
      const resp = await cache.match(key);
      if (!resp) continue;
      const body = await resp.json();
      // Extract the citizen ID and endpoint from the stored URL
      const urlParts = key.url.split("/");
      const citizenId = urlParts[urlParts.length - 2] || "";
      const subEndpoint = urlParts[urlParts.length - 1] || "";
      try {
        const res = await fetch(`${endpointBase}/${citizenId}/${subEndpoint}`, {
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
