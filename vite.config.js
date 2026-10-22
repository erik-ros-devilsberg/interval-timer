import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Interval Timer',
        short_name: 'Intervals',
        description: 'A free interval timer with no trackers and a gentle 3-2-1 beep.',
        theme_color: '#1E3B32',
        background_color: '#1E3B32',
        display: 'standalone',
        orientation: 'any',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        screenshots: [
          { src: 'screenshot.png', sizes: '407x828', type: 'image/png', form_factor: 'narrow', label: 'Analog timer, ready to start' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Only crawlers and install prompts need these; keep them out of the offline cache.
        globIgnores: ['og-image.png', 'screenshot.png'],
      },
    }),
  ],
})
