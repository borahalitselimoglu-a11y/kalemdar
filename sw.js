/* Kalemdar service worker — çevrimdışı önbellek + anımsatıcı bildirimleri. Kullanıcı verisi asla ağa gitmez. */
const CACHE = 'kalemdar-v3';
const ASSETS = ['./', './index.html', './manifest.json', './privacy.html', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/logo-256.png', './lib/jspdf.umd.min.js', './lib/html2canvas.min.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request).then(res => {
    const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res;
  }).catch(() => caches.match('./index.html'))));
});

/* Bildirime dokununca ilgili notu aç */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const id = e.notification.data && e.notification.data.noteId;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) { if ('focus' in c) { c.postMessage({ type: 'open-note', id }); return c.focus(); } }
    return self.clients.openWindow('./?note=' + encodeURIComponent(id || ''));
  }));
});

/* Periyodik arka plan senkronu (Android'de yüklü uygulamalarda, zamanlamayı tarayıcı belirler) */
function idb() { return new Promise((res, rej) => { const r = indexedDB.open('kalemdar', 1); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); r.onupgradeneeded = () => { r.transaction.abort(); }; }); }
async function checkAlarms() {
  let db; try { db = await idb(); } catch { return; }
  const rec = await new Promise(res => { const q = db.transaction('meta').objectStore('meta').get('alarms'); q.onsuccess = () => res(q.result); q.onerror = () => res(null); });
  if (!rec || !rec.list) return;
  const now = Date.now(); let changed = false;
  for (const a of rec.list) {
    if (a.at <= now && !a.shown) {
      await self.registration.showNotification(a.title, { body: a.body, tag: 'rem-' + a.id, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', data: { noteId: a.id }, requireInteraction: true, vibrate: [200, 100, 200] });
      a.shown = true; changed = true;
    }
  }
  if (changed) await new Promise(res => { const q = db.transaction('meta', 'readwrite').objectStore('meta').put(rec); q.onsuccess = res; q.onerror = res; });
}
self.addEventListener('periodicsync', e => { if (e.tag === 'kalemdar-reminders') e.waitUntil(checkAlarms()); });
self.addEventListener('sync', e => { if (e.tag === 'kalemdar-reminders') e.waitUntil(checkAlarms()); });
