# Upgrading from Remix v2.9 to React Router v7

Based on analysis of the trybe repository, here's a comprehensive step-by-step upgrade plan:

## Prerequisites

- **Node.js**: Upgrade to v20+ (currently `>=14`)
- **React**: Already at 18.2.0 ✅
- **Current Remix version**: v2.9.1 ✅

## Step-by-Step Upgrade Process

### 1. **Enable All Remix v2 Future Flags**

Add these to your `remix.config.js`:

```javascript
module.exports = {
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true,
    v3_lazyRouteDiscovery: true,
    v3_singleFetch: true,
    v3_routeConfig: true
  },
  // ... rest of your config
}
```

Test your app thoroughly after enabling each flag.

### 2. **Update Package Dependencies**

Replace Remix packages with React Router v7:

**Remove:**
- `@remix-run/css-bundle` (deprecated)
- `@remix-run/node`
- `@remix-run/react`
- `@remix-run/serve`
- `@remix-run/server-runtime`
- `@remix-run/dev`
- `@clerk/remix`
- `@sentry/remix`
- `remix-auth`
- `remix-utils`

**Add:**
- `react-router` (replaces all @remix-run/* packages)
- `@react-router/node`
- `@react-router/serve`
- `@react-router/dev`
- `@react-router/fs-routes` (for file-based routing)
- `@clerk/react-router`
- `@sentry/react-router`

**Note**: `remix-auth` and `remix-utils` may need alternative solutions or updated versions.

### 3. **Automated Migration**

Run the codemod to automate most changes:
```bash
npx codemod remix/2/react-router/upgrade
```

### 4. **Manual Configuration Changes**

#### **A. Create `react-router.config.ts`** (replaces `remix.config.js`)

```typescript
import type { Config } from "@react-router/dev/config";
import { flatRoutes } from "@react-router/fs-routes";

export default {
  appDirectory: "app",
  ssr: true,
  async routes() {
    return flatRoutes();
  },
} satisfies Config;
```

#### **B. Update `package.json` scripts:**

```json
{
  "scripts": {
    "dev": "find ./ -name \".DS_Store\" -print -delete; dotenv -e .env.development -- react-router dev",
    "build": "find ./ -name \".DS_Store\" -print -delete; react-router build --sourcemap",
    "start": "NODE_OPTIONS='--import ./instrumentation.server.mjs' react-router-serve ./build/server/index.js"
  }
}
```

#### **C. Update `.gitignore`:**

Add:
```
.react-router/
```

#### **D. Update `tsconfig.json`:**

```json
{
  "include": [
    ".react-router/types/**/*",
    "**/*.ts",
    "**/*.tsx"
  ],
  "compilerOptions": {
    "rootDirs": [".", "./.react-router/types"]
  }
}
```

### 5. **Update Entry Files**

#### **`app/entry.client.tsx`**

Change:
```typescript
import { RemixBrowser } from '@remix-run/react'
```
To:
```typescript
import { HydratedRouter } from 'react-router/dom'
```

And update usage from `<RemixBrowser />` to `<HydratedRouter />`

#### **`app/entry.server.tsx`**

Change:
```typescript
import { RemixServer } from '@remix-run/react'
import type { EntryContext } from '@remix-run/node'
```
To:
```typescript
import { ServerRouter } from 'react-router'
import type { EntryContext } from 'react-router'
```

And update usage from `<RemixServer context={remixContext} url={request.url} />` to `<ServerRouter context={remixContext} url={request.url} />`

### 6. **Update All Route Imports**

Throughout your app routes, change:
```typescript
// Old
import { json, redirect, type LoaderFunction, type ActionFunction } from '@remix-run/node'
import { useLoaderData, useActionData, Form } from '@remix-run/react'

// New
import { data, redirect, type LoaderFunction, type ActionFunction } from 'react-router'
import { useLoaderData, useActionData, Form } from 'react-router'
```

**Note**: `json()` becomes `data()` in React Router v7.

### 7. **Update Third-Party Integrations**

#### **Clerk (`app/root.tsx`)**
```typescript
// Old
import { rootAuthLoader } from '@clerk/remix/ssr.server'
import { ClerkApp } from '@clerk/remix'

// New
import { rootAuthLoader } from '@clerk/react-router/ssr.server'
import { ClerkApp } from '@clerk/react-router'
```

#### **Sentry**
- Install `@sentry/react-router`
- Update `app/entry.client.tsx` and `app/entry.server.tsx`
- Use `Sentry.reactRouterTracingIntegration()`

### 8. **Routing Strategy**

You have **95+ route files**. Two options:

**Option A: File-based routing** (recommended for minimal changes)
- Install `@react-router/fs-routes`
- Keep your existing route structure
- Configure in `react-router.config.ts`

**Option B: Route configuration**
- Create `app/routes.ts`
- Manually define route structure
- More control but more work

### 9. **Breaking Changes to Watch For**

1. **CSS handling**: `@remix-run/css-bundle` is removed - use Vite's CSS handling
2. **`json()` → `data()`**: Update all loader/action responses
3. **Type safety**: Load context is now optional and typed as `any` by default
4. **Vite required**: React Router v7 requires Vite (you don't have a vite.config currently)
5. **`remix.env.d.ts` → `env.d.ts`**: Rename and update types

### 10. **Create Vite Configuration**

Create `vite.config.ts`:
```typescript
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [reactRouter()],
});
```

### 11. **Environment Variables Update**

Update `.env` files to use React Router conventions:
- No changes needed for most variables
- Update any Remix-specific env vars
- Ensure `NODE_OPTIONS='--import ./instrumentation.server.mjs'` is set for production

### 12. **Critical Compatibility Issues**

- **`remix-auth`**: May not have React Router v7 support yet - check for updates or alternatives
- **`remix-utils`**: Same concern - verify compatibility
- **`@supabase/auth-helpers-remix`**: Will need React Router equivalent

### 13. **Rollback Strategy**

- Keep current branch as backup
- Document any manual changes made during migration
- Test rollback procedure in staging environment
- Maintain separate deployment pipeline for rollback

### 14. **Testing Strategy**

**Critical flows to test:**
- Authentication (login/logout/signup)
- Form submissions (posts, comments, checkins)
- File uploads (images, videos)
- Real-time features (chat, notifications)
- Navigation between routes
- Error boundaries and 404 handling
- Performance (bundle size, load times)

## Recommended Approach

1. **Create a new branch** for this migration ✅ (rr7upgrade)
2. **Enable future flags first** on main branch and test
3. **Start migration** on feature branch
4. **Use the codemod** for bulk changes
5. **Update integrations** (Clerk, Sentry) carefully
6. **Test thoroughly** especially auth flows
7. **Update Node.js** to v20 in your deployment environment
8. **Create rollback plan** before starting migration

## Estimated Effort

- **Preparation**: 2-4 hours (enabling flags, testing)
- **Migration**: 8-16 hours (depending on manual fixes needed)
- **Testing**: 4-8 hours
- **Total**: 2-3 days of focused work

## Resources

- [Official React Router v7 Upgrade Guide](https://reactrouter.com/upgrading/remix)
- [React Router v7 Documentation](https://reactrouter.com/)
- [Clerk React Router Guide](https://clerk.com/docs/quickstarts/react-router)
- [Sentry React Router Integration](https://docs.sentry.io/platforms/javascript/guides/react-router/)
- [Codemod Registry](https://codemod.com/registry/remix-2-react-router-upgrade)

## Next Steps

- [ ] Enable all future flags in `remix.config.js`
- [ ] Test application with future flags enabled
- [ ] Create `vite.config.ts`
- [ ] Run codemod for automated migration
- [ ] Update package dependencies
- [ ] Create `react-router.config.ts`
- [ ] Update entry files
- [ ] Update third-party integrations
- [ ] Update environment variables
- [ ] Test all critical flows (auth, routing, forms)
- [ ] Test rollback procedure in staging
- [ ] Deploy to staging environment
- [ ] Full QA testing
- [ ] Deploy to production
