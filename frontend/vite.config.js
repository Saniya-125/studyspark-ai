import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 5173);

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': path.join(projectRoot, 'src'),
    },
    dedupe: ['react', 'react-dom'],
  },

  root: projectRoot,

  build: {
    outDir: path.join(projectRoot, 'dist/public'),
    emptyOutDir: true,
  },

  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,

    proxy: {
      '/api': {
        target: process.env.API_URL || 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },

  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});