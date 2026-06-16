/* GONES45 — Service Worker (notifications de match)
   À placer À LA RACINE du repo (même dossier que index.html).
   Reçoit un push "vide", récupère les événements en attente côté Worker,
   et affiche une notif par événement (compo / coup d'envoi / but / fin). */

const G45_PUSH_BASE = 'https://fd-proxy.touraine-antoine.workers.dev';

self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function(event){
  event.waitUntil((async function(){
    var events = [];
    try {
      var sub = await self.registration.pushManager.getSubscription();
      if (sub) {
        var r = await fetch(G45_PUSH_BASE + '/pevents?ep=' + encodeURIComponent(sub.endpoint), { cache: 'no-store' });
        if (r.ok) { var d = await r.json(); events = (d && d.events) || []; }
      }
    } catch (_e) {}

    // Si le push portait directement un payload (secours), on l'utilise
    if (!events.length && event.data) {
      try { var p = event.data.json(); if (p && (p.title || p.events)) events = p.events || [p]; }
      catch (_e2) { try { events = [{ title: 'GONES45 ⚽', body: event.data.text() }]; } catch (_e3) {} }
    }

    if (!events.length) events = [{ title: 'GONES45 ⚽', body: 'Mise à jour du match' }];

    for (var i = 0; i < events.length; i++) {
      var ev = events[i] || {};
      await self.registration.showNotification(ev.title || 'GONES45 ⚽', {
        body: ev.body || '',
        icon: ev.icon || 'icon-192.png',
        badge: 'icon-192.png',
        tag: ev.tag || undefined,          // ex. "but-<matchId>-3" → regroupe/met à jour
        renotify: !!ev.tag,
        vibrate: ev.vibrate || [90, 40, 90, 40, 120],
        timestamp: Date.now(),
        data: { url: ev.url || './' }
      });
    }
  })());
});

self.addEventListener('notificationclick', function(event){
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil((async function(){
    var all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (var i = 0; i < all.length; i++) { if ('focus' in all[i]) { try { return all[i].focus(); } catch (_e) {} } }
    if (self.clients.openWindow) return self.clients.openWindow(url);
  })());
});

// Ré-abonnement automatique si le navigateur invalide l'abonnement
self.addEventListener('pushsubscriptionchange', function(event){
  event.waitUntil((async function(){
    try {
      var appKey = (event.oldSubscription && event.oldSubscription.options && event.oldSubscription.options.applicationServerKey) || null;
      if (!appKey) return;
      var newSub = await self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: appKey });
      await fetch(G45_PUSH_BASE + '/psub', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sub: newSub, resubscribe: true,
          oldEndpoint: event.oldSubscription && event.oldSubscription.endpoint })
      });
    } catch (_e) {}
  })());
});
