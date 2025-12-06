import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Zaffaron Recipe App',
        short_name: 'Zaffaron',
        description: 'A premium Persian recipe collection',
        theme_color: '#e11d48',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        screenshots: [
          {
            src: 'screenshots/mobile.png',
            sizes: '1024x1792',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Home Screen'
          },
          {
            src: 'screenshots/desktop.png',
            sizes: '1792x1024',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Recipe Details'
          }
        ],
        shortcuts: [
          {
            name: "Favorites",
            short_name: "Favs",
            description: "Your favorite recipes",
            url: "/favorites",
            icons: [{ src: "pwa-192x192.png", sizes: "192x192" }]
          },
          {
            name: "Chef Studio",
            short_name: "Chef",
            description: "Create new recipes",
            url: "/chef-studio",
            icons: [{ src: "pwa-192x192.png", sizes: "192x192" }]
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react'],
          openai: ['openai']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
