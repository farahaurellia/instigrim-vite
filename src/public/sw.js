// sw.js

const CACHE_NAME = 'my-app-cache-v1';
const API_CACHE_NAME = 'api-cache-v1'; // Cache terpisah untuk respons API
const IMAGE_CACHE_NAME = 'image-cache-v1'; // Cache untuk gambar cerita

const urlsToCache = [
  '/',
  '/index.html',
  '/styles/styles.css',
  '/scripts/index.js',
  '/scripts/app.js',
  '/scripts/routes/routes.js',
  '/scripts/routes/url-parser.js',
  '/scripts/utils/notification-hub.js',
  '/scripts/notifBtn.js',
  '/images/logo-192.png',
  '/images/logo-512.png',
  '/favicon.ico',
  '/404.html',
  // ⭐ TAMBAHKAN PATH UNTUK SETIAP VIEW DI SINI ⭐
  '/pages/home/homeView.js', // Penting agar home bisa diakses
  '/pages/login/loginView.js',
  '/pages/register/registerView.js',
  '/pages/add-story/addStoryView.js',
  '/pages/not-found/notFoundView.js',
  '/pages/saved-stories/savedStoriesView.js', // Jika ada halaman saved stories
  // Dan semua Presenter/Model yang diimpor langsung oleh View tersebut
  '/pages/login/loginModel.js',
  '/pages/login/loginPresenter.js',
  '/pages/register/registerModel.js',
  '/pages/register/registerPresenter.js',
  '/pages/add-story/addStoryModel.js',
  '/pages/add-story/addStoryPresenter.js',
  '/pages/saved-stories/savedStoriesModel.js',
  '/pages/saved-stories/savedStoriesPresenter.js',
  // Untuk DetailStoryView, mungkin tidak perlu pre-cache langsung jika datanya dinamis,
  // tapi JavaScript untuk View/Presenter-nya tetap perlu:
  '/pages/detail-story/detailStoryView.js',
  '/pages/detail-story/detailStoryModel.js',
  '/pages/detail-story/detailStoryPresenter.js',
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service worker is installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch(error => {
        console.error('Failed to cache some URLs during install:', error);
      });
    })
  );
  self.skipWaiting();
});

// Activate event (tetap sama)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME && name !== IMAGE_CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// ⭐ MODIFIKASI PENTING PADA FETCH EVENT ⭐
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // 1. Tangani permintaan ke API Anda
  // Asumsi URL API Anda mengandung '/stories' atau '/auth'
  if (requestUrl.origin === self.location.origin && requestUrl.pathname.includes('/stories')) {
    // Strategi Network First for API: Coba dari jaringan, jika gagal, coba dari cache.
    // Ini cocok untuk data yang sering berubah.
    event.respondWith(
      caches.open(API_CACHE_NAME).then(async (cache) => {
        try {
          const response = await fetch(event.request);
          // Hanya cache respons 200 OK
          if (response.status === 200) {
            cache.put(event.request, response.clone()); // Simpan respons ke cache
          }
          return response;
        } catch (error) {
          // Jika gagal dari jaringan (offline atau error), coba dari cache
          console.log('API request failed, falling back to cache:', error);
          const cachedResponse = await cache.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Jika tidak ada di cache dan offline, kembalikan fallback offline
          return new Response('API data not available offline', { status: 503, statusText: 'Service Unavailable' });
        }
      })
    );
    return; // Hentikan pemrosesan selanjutnya
  }

  // 2. Tangani permintaan gambar (misalnya photoUrl dari cerita)
  if (event.request.destination === 'image') {
    // Strategi Cache First for Images: Coba dari cache dulu, jika tidak ada, ambil dari jaringan.
    // Ini cocok untuk gambar yang jarang berubah dan ingin ditampilkan cepat.
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        const networkResponse = await fetch(event.request);
        if (networkResponse.status === 200) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(() => {
        // Fallback gambar default jika offline dan tidak ada di cache
        return caches.match('/images/placeholder.png'); // Pastikan Anda memiliki gambar placeholder
      })
    );
    return; // Hentikan pemrosesan selanjutnya
  }

  // 3. Tangani permintaan navigasi (HTML pages) dan aset statis lainnya
  // Strategi Cache Only for Pre-cached Assets (or Cache First, but simpler for pre-cached)
  // Atau Network First dengan fallback ke offline page untuk navigasi
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        // Perbaikan Content-Type untuk CSS dari cache (seperti yang sudah ada)
        if (requestUrl.pathname.includes('/styles.css') && response.headers.get('Content-Type') !== 'text/css') {
          console.warn('Correcting Content-Type for styles.css from cache!');
          const headers = new Headers(response.headers);
          headers.set('Content-Type', 'text/css');
          return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
        }
        return response; // Kembali dari cache
      }

      // Jika tidak di cache, coba dari jaringan
      return fetch(event.request).catch(() => {
        // ⭐ Fallback untuk halaman HTML yang tidak di-cache dan offline ⭐
        // Ini akan menangani URL navigasi yang gagal atau aset statis lainnya
        // yang tidak di-cache dan pengguna offline.
        if (event.request.mode === 'navigate') {
          return caches.match('/404.html'); // Arahkan ke halaman 404 Anda
        }
        // Fallback generik untuk aset non-HTML lainnya
        return new Response('Offline or resource not found', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});

// Push notification event (tetap sama)
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

// Klik notifikasi (tetap sama)
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