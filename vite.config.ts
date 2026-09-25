import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  const isElectron = process.env.ELECTRON_BUILD === 'true' || process.env.npm_lifecycle_event === 'electron:build';
  const base = isElectron ? './' : '/ud-loan/';

  return {
    base,

    plugins: [
      react(),
      tailwindcss(),

      VitePWA({
        registerType: 'autoUpdate',

        includeAssets: [
          'favicon.ico',
          'apple-touch-icon.png',
          'icon.svg',
        ],

        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,json}'],
        },

        manifest: {
          id: isElectron ? './' : '/ud-loan/',
          name: 'UD Loan Calculator',
          short_name: 'UD Loan Calc',
          description:
            'UD Loan Calculator with Loan Calculator, Pay Sheet Calculator, and Application download center.',
          theme_color: '#0a2540',
          background_color: '#0a2540',
          display: 'standalone',
          orientation: 'portrait',
          start_url: isElectron ? './' : '/ud-loan/',
          scope: isElectron ? './' : '/ud-loan/',

          icons: [
            {
              src: isElectron
                ? './pwa-192x192.png'
                : '/ud-loan/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: isElectron
                ? './pwa-512x512.png'
                : '/ud-loan/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: isElectron
                ? './pwa-maskable-512x512.png'
                : '/ud-loan/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },

        devOptions: {
          enabled: !isElectron,
          type: 'module',
        },
      }),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

