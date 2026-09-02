import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon.svg'],
      manifest: {
        name: 'Goethe German Vocabulary (A1 • A2 • B1)',
        short_name: 'GoetheVocab',
        description: 'Official Goethe-Institut German Vocabulary Platform with Audio, 3D Flashcards & Quizzes',
        theme_color: '#18181b',
        background_color: '#f4f4f5',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'icon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,csv}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024 // Cache datasets up to 6MB
      }
    })
  ],
  server: {
    port: 3000,
    open: false,
  }
});
