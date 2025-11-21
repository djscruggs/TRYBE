import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import tailwindcss from '@tailwindcss/postcss';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [reactRouter()],
  css: {
    postcss: {
      plugins: [
        tailwindcss
      ]
    }
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app')
    }
  },
  optimizeDeps: {
    include: [
      '@clerk/clerk-react',
      'styled-components',
      'react-data-table-component'
    ]
  },
  ssr: {
    noExternal: ['react-icons']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    }
  },
  server: {
    port: 3000,
    host: true,
    allowedHosts: ['.ngrok-free.app'],
    fs: {
      allow: ['..']
    }
  }
});
