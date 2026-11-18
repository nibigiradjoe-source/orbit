/* Orbit offline worker: precache the app and every course file; serve cache-first, refresh in the background. */
const VERSION = 'orbit-v5';
const SHELL = ['./', 'index.html', 'css/app.css', 'js/app.js', 'js/scenes.js', 'content/catalog.json', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'js/vendor/three.min.js'];
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await c.addAll(SHELL);
    try {
      const cat = await (await fetch('content/catalog.json', { cache: 'no-cache' })).json();
      const files = [...new Set(cat.courses.map(x => x.content).filter(Boolean))];
      await c.addAll(files);
    } catch (_) { /* courses cache on first open instead */ }
    self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => { for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k); await self.clients.claim(); })());
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith((async () => {
    const c = await caches.open(VERSION);
    const hit = await c.match(req, { ignoreSearch: true });
    const net = fetch(req).then(res => { if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone()); return res; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const res = await net;
    return res || (req.mode === 'navigate' ? c.match('index.html') : new Response('', { status: 504 }));
  })());
});
