/* Service Worker für den Offline-Betrieb (Flugmodus).
   build.py ersetzt 5addf10f027c bei jedem Build, damit Updates ankommen. */
const VERSION = "5addf10f027c";
const CACHE = "athen-kompass-" + VERSION;
const RUNTIME = "athen-kompass-runtime";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg", "./icon-180.png", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(CORE.map((u) => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("athen-kompass-") && k !== CACHE && k !== RUNTIME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Seite selbst: erst Netz (damit Updates ankommen), ohne Netz aus dem Speicher
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put("./index.html", copy)); }
          return res;
        })
        .catch(() => caches.match("./index.html").then((r) => r || caches.match("./")))
    );
    return;
  }

  // Eigene Dateien (Icons, Manifest): aus dem Speicher, im Hintergrund aktualisieren
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req, { ignoreSearch: true }).then((hit) => {
        const net = fetch(req)
          .then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return res; })
          .catch(() => hit);
        return hit || net;
      })
    );
    return;
  }

  // Schriften von Google Fonts: einmal laden, dann aus dem Speicher
  if (/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(
      caches.open(RUNTIME).then((c) =>
        c.match(req).then((hit) => hit || fetch(req).then((res) => { c.put(req, res.clone()); return res; }))
      )
    );
  }
});

// Die Seite schickt nach dem ersten Laden die Schrift-URLs, damit auch die offline da sind
self.addEventListener("message", (e) => {
  const d = e.data || {};
  if (d.type === "cache-urls" && Array.isArray(d.urls)) {
    e.waitUntil(
      caches.open(RUNTIME).then((c) =>
        Promise.all(d.urls.map((u) => c.match(u).then((hit) => hit || fetch(u, { mode: "no-cors" }).then((r) => c.put(u, r)).catch(() => {}))))
      )
    );
  }
});
