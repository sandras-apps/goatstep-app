import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages serves the app from https://sandras-apps.github.io/goatstep-app/
// so the published build needs that folder name as its base path.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/goatstep-app/' : '/',
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: 'Goatstep',
        short_name: 'Goatstep',
        description: "The stubborn goat's step. Build new habits, one step at a time.",
        theme_color: '#FAF7F2',
        background_color: '#FAF7F2',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,webp,png,woff2}'],
        // Font files for alphabets we don't use are only downloaded if ever needed.
        globIgnores: ['**/*-{cyrillic,greek,vietnamese}-*.woff2']
      }
    })
  ]
}));
