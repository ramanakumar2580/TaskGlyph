// public/sw.js
const CACHE_NAME = "taskglyph-app-shell-v1";
const OFFLINE_URL = "/offline.html"; // optional fallback page

const PRECACHE_URLS = [
  "/",
  OFFLINE_URL,
  "/favicon.ico",
  "/manifest.json",
  // don't list hashed _next files here (they change). runtime handler caches them.
];

self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evt) => {
  evt.waitUntil(self.clients.claim());
});

function isNavigationRequest(req) {
  return (
    req.mode === "navigate" ||
    (req.method === "GET" && req.headers.get("accept")?.includes("text/html"))
  );
}

self.addEventListener("fetch", (evt) => {
  const req = evt.request;

  // 1) Navigation requests -> network-first (so HTML is fresh), fallback to cache
  if (isNavigationRequest(req)) {
    evt.respondWith(
      fetch(req)
        .then((res) => {
          // update cache for next time
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches
            .match(req)
            .then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // 2) _next/static or other static assets -> cache-first
  if (
    req.url.includes("/_next/") ||
    req.destination === "image" ||
    req.destination === "script" ||
    req.destination === "style"
  ) {
    evt.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req)
          .then((res) => {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, resClone));
            return res;
          })
          .catch(() => cached || Response.error());
      })
    );
    return;
  }

  // 3) API / dynamic requests -> try network, fallback to cache (so offline can still serve previously cached GET responses)
  if (req.url.includes("/api/") && req.method === "GET") {
    evt.respondWith(
      fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // default: let browser handle
});

// listen for sync-like message from clients (we will send FLUSH_OUTBOX)
self.addEventListener("message", () => {
  // no-op for now - client listens to SW messages too
  // keep for future
});

// Optional: notify clients when service worker detects online (not used here directly)
self.addEventListener("online", () => {
  // browsers typically don't fire this in SW; clients handle online events
});
