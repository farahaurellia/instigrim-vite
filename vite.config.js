import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'src', 'public'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      
      // 'includeAssets' harus disesuaikan dengan path ikon dan screenshots Anda
      // yang berada di 'publicDir' atau di root 'src' jika tidak melalui publicDir
      // Jika 'images' ada di dalam 'src/public', maka 'includeAssets' akan tetap '/images/...'
      // Jika 'screenshots' ada di dalam 'src/images/icons', pastikan path relatifnya benar dari root build
      includeAssets: [
        'favicon.ico', 'robots.txt', // Contoh aset lain yang mungkin di public
        // Ikon dari manifest
        '/images/logo-192.png',
        '/images/logo-512.png',
        // Screenshots dari manifest
        'images/icons/screenshots/Screenshot1.png', // Sesuaikan path ini jika mereka tidak di root publicDir
        'images/icons/screenshots/Screenshot2.png', // Contoh: jika mereka di src/public/images/icons,
        'images/icons/screenshots/Screenshot3.png'  // maka path di sini harus 'images/icons/screenshotX.png'
                                        // tanpa '/' di awal jika 'publicDir' adalah root untuk aset tersebut
      ],
      
      // ------ Konfigurasi manifest dipindahkan ke sini ------
      manifest: {
        name: "JejakKaki",
        short_name: "JejakKaki",
        description: "Aplikasi Sosial Media untuk berbagi cerita perjalanan dan pengalaman.",
        start_url: "/index.html", // Pastikan ini mengarah ke file HTML utama Anda di direktori build
        display: "standalone",
        background_color: "#F0F2BD",
        theme_color: "#4B352A",
        icons: [
          {
            src: "/images/logo-192.png", // Path ini relatif terhadap 'start_url' atau root aplikasi
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/images/logo-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ],
        screenshots: [
          {
            src: "images/icons/screenshot1.png", // Path ini harus relatif dari root build
            sizes: "640x480",
            type: "image/png",
            label: "Tampilan Beranda"
          },
          {
            src: "images/icons/screenshot2.png",
            sizes: "640x480",
            type: "image/png",
            label: "Tampilan Profil"
          },
          {
            src: "images/icons/screenshot3.png",
            sizes: "640x480",
            type: "image/png",
            label: "Tampilan Peta"
          }
        ],
        orientation: "portrait",
        scope: "/",
        lang: "en"
      },
      // ----------------------------------------------------

      workbox: {
        // Pastikan globPatterns mencakup semua aset yang Anda ingin pre-cache,
        // termasuk yang ada di `publicDir` dan dihasilkan oleh Vite.
        globPatterns: [
            '**/*.{js,css,html,ico,png,svg,jpg,json}', // Ini akan mencakup ikon dan screenshots
            'images/icons/screenshots/*.png' // eksplisit untuk screenshots
        ],
        runtimeCaching: [
          // Tambahkan strategi caching sesuai kebutuhan Anda
          // Misalnya untuk API, gambar dari CDN, atau aset eksternal lainnya
        ],
      },
    }),
  ],
});