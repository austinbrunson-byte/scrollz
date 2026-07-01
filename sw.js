/* SCROLLZ service worker — NETWORK-FIRST so the app always updates when online,
   and still works offline by falling back to the last cached copy.
   Bump SW_VERSION whenever you ship a new build to force a fresh cache. */
const SW_VERSION = 'scrollz-v14';
const CORE = [
  './brainrot.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png',
  './img/drake.jpg','./img/fine.jpg','./img/rollsafe.jpg','./img/pigeon.jpg',
  './img/harold.jpg','./img/disastergirl.jpg','./img/success.jpg','./img/fry.jpg',
  './img/aag.jpg','./img/mordor.jpg','./img/interesting.jpg','./img/kermit.jpg',
  './img/cmm.jpg','./img/blb.jpg','./img/stonks.jpg','./img/philosoraptor.jpg',
  './img/yuno.jpg','./img/grumpycat.jpg'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(SW_VERSION).then(c => c.addAll(CORE).catch(()=>{})));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== SW_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Network-first: get the freshest version, cache it, fall back to cache offline.
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(SW_VERSION).then(c => c.put(req, copy)).catch(()=>{});
      return res;
    }).catch(() => caches.match(req).then(m => m || caches.match('./brainrot.html')))
  );
});

// let the page trigger an immediate activation of a new worker
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
