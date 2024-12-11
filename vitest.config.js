import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    threads: false,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts', './test/setup.integration.ts'],
    include: ['**/*.test.ts', './app/**/integration/*.test.ts']

  }
})
