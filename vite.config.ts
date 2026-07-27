import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    // 👇 METS LE NOM EXACT DE TON REPO ICI (avec les slashs)
    base: './', 
    
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), cloudflare()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            framer: ['framer-motion'],
            lucide: ['lucide-react']
          }
        }
      }
    }
  };
});