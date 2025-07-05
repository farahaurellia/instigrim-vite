const CACHE_NAME = 'my-app-cache-v1'; // Keep this name consistent
const urlsToCache = [
  '/',
  '/index.html',
  // '/app.webmanifest',
  // '/styles/styles.css', // Ensure this path is correct
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service worker is installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // It's good practice to ensure all items are added here,
      // and handle any failures in addAll.
      return cache.addAll(urlsToCache).catch(error => {
          console.error('Failed to cache some URLs:', error);
      });
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        // If the request is for a CSS file AND its Content-Type is wrong, correct it
        if (event.request.url.includes('/styles.css') && response.headers.get('Content-Type') !== 'text/css') {
            console.warn('Correcting Content-Type for styles.css from cache!');
            const headers = new Headers(response.headers);
            headers.set('Content-Type', 'text/css');
            return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
        }
        return response; // Return the cached response
      }

      // If not in cache, fetch from network
      return fetch(event.request).catch(() => {
        // Fallback for offline or network error
        return new Response('Offline or resource not found', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});

// Push notification event sesuai schema API
self.addEventListener('push', (event) => {
  console.log('Service worker pushing...');
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Push event data error:', e);
    }
  }

  // Schema: { title: "...", options: { body: "...", ... } }
  const title = data.title || 'Notifikasi Baru';
  const options = {
    body: data.options?.body || '',
    icon: data.options?.icon || '/icon-192x192.png',
    badge: data.options?.badge || '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.options?.url || '/',
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Klik notifikasi: buka url terkait
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (let client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});