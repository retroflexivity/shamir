// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind()],
  i18n: {
    defaultLocale: 'ru',
    locales: ['ru', 'lv', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    build: {
      // Reduce memory usage during build
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // Manual chunking to reduce memory pressure
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor';
              }
              if (id.includes('marked')) {
                return 'marked-vendor';
              }
              return 'vendor';
            }
          },
        },
      },
    },
    // Reduce worker memory usage
    worker: {
      format: 'es',
    },
  },
});
