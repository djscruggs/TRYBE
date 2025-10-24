import type { Config } from '@react-router/dev/config'

export default {
  appDirectory: 'app',
  ssr: true,
  future: {
    v8_middleware: true
  },
  routes: async () => await import('./app/routes')
} satisfies Config
