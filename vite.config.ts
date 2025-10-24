import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  plugins: [reactRouter()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app')
    }
  },
  optimizeDeps: {
    include: ['@clerk/clerk-react', '@material-tailwind/react', 'styled-components', 'react-data-table-component']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    }
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
})
