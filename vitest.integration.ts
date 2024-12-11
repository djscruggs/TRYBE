// <reference types="vitest" />
// <reference types="vite/client" />

import { config } from 'dotenv'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    // allows you to use stuff like describe, it, vi without importing
    globals: true,
    setupFiles: ['./test/setup.integration.ts'],
    include: ['./app/**/integration/*.test.ts'],
    env: {
      ...config({ path: '.env.test' }).parsed
    }
  }
})
