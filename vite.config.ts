import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  plugins: [reactRouter()],
  css: {
    postcss: {
      plugins: [
        require('@tailwindcss/postcss')
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
