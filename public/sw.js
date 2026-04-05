// Penguin Social Club — Service Worker
// Minimal SW to enable PWA install + fullscreen mode on tablets
// POS requires live data, so we only cache static assets

const CACHE_NAME = 'penguin-v1'
const STATIC_ASSETS = [
  '/logo.png',
  '/manifest.json',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  // Only cache GET requests for static assets
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)

  // Static assets: cache-first
  if (STATIC_ASSETS.some((asset) => url.pathname === asset)) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    )
    return
  }

  // Everything else: network-first (POS needs live data)
  event.respondWith(fetch(event.request))
})
