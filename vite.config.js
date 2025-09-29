// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist-web',
    emptyOutDir: true,
    rollupOptions: {
      input: [
        'index.html',
        'system-admin.html',
        'sync-test.html'
      ]
    }
  },
  server: { port: 5173, open: false }
});


