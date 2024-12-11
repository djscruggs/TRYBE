import type * as integration from './test/factory'

declare module 'vitest' {
  export interface TestContext {
    request: Request
    integration: typeof integration
  }
}
