// sw.js

const CACHE_NAME = 'my-app-cache-v1';
const API_CACHE_NAME = 'api-cache-v1';
const IMAGE_CACHE_NAME = 'image-cache-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.webmanifest', // Pastikan ini di sini
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
  // PATH UNTUK SETIAP VIEW DAN DEPENDENSI JS/CSS MEREKA
  '/pages/home/homeView.js',
  '/pages/login/loginView.js',
  '/pages/register/registerView.js',
  '/pages/add-story/addStoryView.js',
  '/pages/not-found/notFoundView.js',
  '/pages/saved-stories/savedStoriesView.js',
  '/pages/login/loginModel.js',
  '/pages/login/loginPresenter.js',
  '/pages/register/registerModel.js',
  '/pages/register/registerPresenter.js',
  '/pages/add-story/addStoryModel.js',
  '/pages/add-story/addStoryPresenter.js',
  '/pages/saved-stories/savedStoriesModel.js',
  '/pages/saved-stories/savedStoriesPresenter.js',
  '/pages/detail-story/detailStoryView.js',
  '/pages/detail-story/detailStoryModel.js',
  '/pages/detail-story/detailStoryPresenter.js',
  '/images/placeholder.png', // Contoh: jika Anda punya placeholder, sesuaikan nama
  '/styles/auth.css', // Contoh: tambahkan semua file CSS Anda
  '/styles/detailStory.css',
  '/styles/savedStories.css',
  '/styles/notFound.css',
  // Tambahkan juga semua aset gambar, font, atau file lain yang dibutuhkan app shell
  // yang mungkin tidak melalui "image" destination, misalnya ikon dari feather-icons
  // '/scripts/feather-icons.js' // Jika Anda mengimpor ini atau serupa.
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service worker is installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching App Shell assets...');
      // ⭐ PENTING: Iterasi melalui urlsToCache dan fetch/put secara manual
      // untuk mengatasi query parameters Vite.
      const cachePromises = urlsToCache.map(url => {
        const requestUrl = new URL(url, self.location.origin);
        requestUrl.search = ''; // Hapus query parameters untuk URL yang akan di-cache

        // Buat Request baru dengan URL yang bersih
        const cleanRequest = new Request(requestUrl.toString());

        return fetch(cleanRequest) // Ambil aset dengan URL bersih dari jaringan
          .then(response => {
            if (!response.ok) {
              console.warn(`Failed to fetch ${url} for caching: ${response.status} ${response.statusText}`);
              return null; // Jangan cache respons yang gagal
            }
            // Simpan respons ke cache dengan Request yang bersih
            return cache.put(cleanRequest, response.clone());
          })
          .catch(error => {
            console.error(`Error caching ${url}:`, error);
            return null;
          });
      });
      return Promise.all(cachePromises.filter(p => p !== null)); // Tunggu semua selesai
    }).catch(installError => {
        console.error('Service Worker installation failed during open/add:', installError);
    })
  );
  self.skipWaiting();
});

// Activate event (tetap sama)
self.addEventListener('activate', (event) => {
  console.log('Service worker is activating...');
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
  console.log('Service worker activated, old caches cleared.');
});

// ⭐ MODIFIKASI KRITIKAL PADA FETCH EVENT ⭐
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // 1. Tangani permintaan ke API Anda (Network First)
  if (requestUrl.origin === self.location.origin && requestUrl.pathname.includes('/stories')) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(async (cache) => {
        try {
          const response = await fetch(event.request);
          if (response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        } catch (error) {
          console.log('API request failed, falling back to cache:', error);
          const cachedResponse = await cache.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response('API data not available offline', { status: 503, statusText: 'Service Unavailable' });
        }
      })
    );
    return;
  }

  // 2. Tangani permintaan gambar (Cache First)
  if (event.request.destination === 'image') {
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
        return caches.match('/images/placeholder.png'); // Pastikan ini ada
      })
    );
    return;
  }

  // 3. Tangani permintaan navigasi (HTML pages) dan aset statis lainnya
  const cleanedRequestUrl = new URL(event.request.url);
  cleanedRequestUrl.search = ''; // Hapus query parameters untuk pencarian cache

  event.respondWith(
    caches.match(cleanedRequestUrl.toString()).then(async (response) => { // Gunakan URL bersih untuk matching
      if (response) {
        // ⭐ BAGIAN PENTING: Perbaiki Content-Type saat melayani dari cache ⭐
        const headers = new Headers(response.headers); // Dapatkan headers dari respons yang di-cache

        if (cleanedRequestUrl.pathname.endsWith('.webmanifest')) {
          headers.set('Content-Type', 'application/manifest+json');
          console.log(`[SW] Correcting Content-Type for manifest to application/manifest+json.`);
        } else if (cleanedRequestUrl.pathname.endsWith('.css')) {
          headers.set('Content-Type', 'text/css');
          console.log(`[SW] Correcting Content-Type for CSS to text/css.`);
        } else if (cleanedRequestUrl.pathname.endsWith('.js')) {
          headers.set('Content-Type', 'application/javascript');
          console.log(`[SW] Correcting Content-Type for JS to application/javascript.`);
        }
        // Tambahkan kondisi lain jika ada jenis file lain yang Content-Type-nya sering salah,
        // contoh: .json, .svg, .woff, .ttf, dll.

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: headers // Gunakan headers yang sudah dimodifikasi
        });
      }

      // Jika tidak di cache, coba dari jaringan
      return fetch(event.request).catch(() => {
        // Fallback untuk permintaan navigasi utama
        if (event.request.mode === 'navigate') {
          return caches.match('/404.html');
        }
        // Fallback generik untuk aset lain yang gagal dimuat
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