import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'src', 'public'), // Files here are copied directly to dist/
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
      
      // 'includeAssets' should be correct here if your files are in src/public/images/icons/screenshots/
      includeAssets: [
        'favicon.ico', 'robots.txt',
        '/images/logo-192.png',
        '/images/logo-512.png',
        // ⭐ Ensure these paths match the actual location in your 'src/public' folder ⭐
        // And use the EXACT filename (case-sensitive)
        'images/icons/screenshots/Screenshot1.png',
        'images/icons/screenshots/Screenshot2.png',
        'images/icons/screenshots/Screenshot3.png',
      ],
      
      manifest: {
        name: "JejakKaki",
        short_name: "JejakKaki",
        description: "Aplikasi Sosial Media untuk berbagi cerita perjalanan dan pengalaman.",
        start_url: "/index.html",
        display: "standalone",
        background_color: "#F0F2BD",
        theme_color: "#4B352A",
        icons: [
          {
            src: "/images/logo-192.png",
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
            // ⭐ FIX THESE PATHS: Add leading '/' to make them root-relative ⭐
            // Assumes your images are in 'src/public/images/icons/screenshots/'
            src: "/images/icons/screenshots/Screenshot1.png",
            sizes: "640x480",
            type: "image/png",
            label: "Tampilan Beranda"
          },
          {
            src: "/images/icons/screenshots/Screenshot2.png",
            sizes: "640x480",
            type: "image/png",
            label: "Tampilan Profil"
          },
          {
            src: "/images/icons/screenshots/Screenshot3.png",
            sizes: "640x480",
            type: "image/png",
            label: "Tampilan Peta"
          }
        ],
        orientation: "portrait",
        scope: "/",
        lang: "en"
      },
      filename: 'manifest.webmanifest',
      workbox: {
        globPatterns: [
            '**/*.{js,css,html,ico,png,svg,jpg,json}',
            // Ensure this glob pattern correctly matches the files' location in 'dist'
            // If screenshots are in 'dist/images/icons/screenshots/', this is correct.
            'images/icons/screenshots/*.png'
        ],
        runtimeCaching: [
          // ... (your runtime caching strategies) ...
        ],
      },
    }),
  ],
});