export type {};
declare const globalThis: ServiceWorkerGlobalScope;

console.log("[SW] booted up?");

globalThis.addEventListener('install', event => {
    // Perform install steps.
    console.log('[SW] Install event', event);
});

globalThis.addEventListener('activate', event => {
    console.log('[SW] activate event', event);
});

globalThis.addEventListener('message', event => {
    console.log('[SW] message event:', event);
    globalThis.clients.matchAll().then(function(clients: any) {
        clients.forEach(function(client: any) {
          console.log(client);
          client.postMessage('The service worker just started up.');
        });
      });
});

globalThis.addEventListener('fetch', (event: any) => {
    console.log('[SW] fetch event:', event);
    event.respondWith(fetch(event.request))
});
