import * as integration from './factory'

// types.d.ts
beforeEach((ctx: any) => {
  ctx.request = new Request('http://localhost')
  ctx.integration = integration
})
