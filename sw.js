/* Minimal service worker — enough to make the site installable.
   It does NOT cache anything; every request goes to the network.
   This avoids stale-content bugs while still satisfying Chrome's
   installability check. */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
self.addEventListener('fetch', () => {});   // network-only, do nothing
