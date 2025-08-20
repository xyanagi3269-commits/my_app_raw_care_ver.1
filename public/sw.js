// This is a basic service worker with 'install' and 'activate' events.

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  // The skipWaiting() method allows this service worker to activate
  // as soon as it's finished installing.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  // The claim() method allows an active service worker to set itself as the
  // controller for all clients within its scope.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // We are not implementing any caching strategy yet.
  // This is just a placeholder for future development.
  // The browser will handle the request as if there were no service worker.
});
