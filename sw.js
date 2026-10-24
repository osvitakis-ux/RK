// Родинна каса — офлайн-кеш оболонки застосунку (дані Supabase не кешуються)
const CACHE='rk-v2';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET' || u.hostname.endsWith('supabase.co')) return;       // хмара — завжди наживо
  if(e.request.mode==='navigate' || u.origin===location.origin){                    // сторінка — спершу мережа (свіжа версія)
    e.respondWith(fetch(e.request).then(r=>{ const cp=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,cp)); return r; })
      .catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
    return;
  }
  // бібліотеки й шрифти з CDN — з кешу, з фоновим оновленням
  e.respondWith(caches.match(e.request).then(hit=>{
    const net=fetch(e.request).then(r=>{ if(r.ok||r.type==='opaque'){ const cp=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,cp)); } return r; }).catch(()=>hit);
    return hit||net;
  }));
});
