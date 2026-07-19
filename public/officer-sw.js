// TPF Officer Service Worker — Phase 2 PWA
// Handles offline caching for officer operational screens

const CACHE_VERSION = "tpf-officer-v1";
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const API_CACHE     = `${CACHE_VERSION}-api`;

// App shell — pages that should always be available offline
const APP_SHELL = [
  "/officer/traffic/home",
  "/officer/general/home",
  "/officer/post/home",
  "/police-logo.png",
  "/officer-manifest.json",
];

// ── Install: cache the app shell ─────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: clean old caches ────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("tpf-officer-") && key !== STATIC_CACHE && key !== API_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch strategy ─────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  // API routes: Network-first, fall back to cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(API_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached ?? new Response(
          JSON.stringify({ error: "Huna muunganisho wa mtandao", offline: true }),
          { status: 503, headers: { "Content-Type": "application/json" } }
        )))
    );
    return;
  }

  // Next.js static assets: Cache-first
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached ?? fetch(request).then((response) => {
          if (response.ok) {
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        })
      )
    );
    return;
  }

  // Officer pages: Network-first, fall back to cached shell
  if (url.pathname.startsWith("/officer/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match(request)
          .then((cached) => cached ?? caches.match("/officer/traffic/home"))
        )
    );
    return;
  }

  // Default: network
  event.respondWith(fetch(request));
});

// ── Background sync for offline actions ───────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-citations") {
    event.waitUntil(syncPendingCitations());
  }
  if (event.tag === "sync-incidents") {
    event.waitUntil(syncPendingIncidents());
  }
});

async function syncPendingCitations() {
  // Citations saved offline are posted when connectivity returns
  const cache = await caches.open("tpf-officer-pending");
  const keys  = await cache.keys();
  await Promise.all(
    keys
      .filter((r) => r.url.includes("pending-citation"))
      .map(async (r) => {
        const data = await cache.match(r);
        if (!data) return;
        const body = await data.json();
        try {
          const res = await fetch("/api/citations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          if (res.ok) await cache.delete(r);
        } catch { /* retry next sync */ }
      })
  );
}

async function syncPendingIncidents() {
  const cache = await caches.open("tpf-officer-pending");
  const keys  = await cache.keys();
  await Promise.all(
    keys
      .filter((r) => r.url.includes("pending-incident"))
      .map(async (r) => {
        const data = await cache.match(r);
        if (!data) return;
        const body = await data.json();
        try {
          const res = await fetch("/api/incidents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          if (res.ok) await cache.delete(r);
        } catch { /* retry next sync */ }
      })
  );
}

// ── Push notifications ─────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json().catch(() => ({ title: "TPF Alert", body: event.data.text() }));
  event.waitUntil(
    data.then((payload) =>
      self.registration.showNotification(payload.title ?? "TPF Officer", {
        body:    payload.body ?? "",
        icon:    "/police-logo.png",
        badge:   "/police-logo.png",
        tag:     payload.tag ?? "tpf-alert",
        data:    payload.data ?? {},
        actions: [
          { action: "view",    title: "Angalia" },
          { action: "dismiss", title: "Funga"   },
        ],
      })
    )
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      const focused = clients.find((c) => c.focused);
      if (focused) return focused.focus();
      if (clients[0]) return clients[0].focus();
      return self.clients.openWindow("/officer/traffic/home");
    })
  );
});
