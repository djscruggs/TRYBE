import React, { useEffect } from 'react'
import { useLocation, useNavigationType, createRoutesFromChildren, matchRoutes } from 'react-router-dom'
import * as ReactDOM from 'react-dom/client'
import { RemixBrowser } from '@remix-run/react'
import { CacheProvider } from '@emotion/react'
import ClientStyleContext from './ClientStyleContext'
import createEmotionCache from './createEmotionCache'
import { ThemeProvider } from '@material-tailwind/react'
import * as Sentry from '@sentry/react'
Sentry.init({
  environment: process.env.NODE_ENV,
  dsn: 'https://4f3a1762974e77da7b1e34738080185@o4506538845929472.ingest.us.sentry.io/4506538846126080',
  tunnel: '/tunnel',
  beforeSend (event, hint) {
    // Check if it is an exception, and if so, show the report dialog
    if (event.exception && event.event_id) {
      Sentry.showReportDialog({ eventId: event.event_id })
    }
    return event
  },
  integrations: [
    // See docs for support of different versions of variation of react router
    // https://docs.sentry.io/platforms/javascript/guides/react/configuration/integrations/react-router/
    Sentry.reactRouterV6BrowserTracingIntegration({
      useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes
    }),
    Sentry.feedbackIntegration({
      // Additional SDK configuration goes in here, for example:
      colorScheme: 'system'
    }),
    Sentry.replayIntegration()
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  tracesSampleRate: 1.0,

  // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ['localhost', /^https:\/\/app.jointhetrype.com/],

  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
})

interface ClientCacheProviderProps {
  children: React.ReactNode
}
function ClientCacheProvider ({ children }: ClientCacheProviderProps): JSX.Element {
  const [cache, setCache] = React.useState(createEmotionCache())

  const clientStyleContextValue = React.useMemo(
    () => ({
      reset () {
        setCache(createEmotionCache())
      }
    }),
    []
  )

  return (
    <ClientStyleContext.Provider value={clientStyleContextValue}>
      <CacheProvider value={cache}>{children}</CacheProvider>
    </ClientStyleContext.Provider>
  )
}

const hydrate = (): void => {
  React.startTransition(() => {
    ReactDOM.hydrateRoot(
      document,
      <ClientCacheProvider>
        <ThemeProvider>
          <RemixBrowser />
        </ThemeProvider>
      </ClientCacheProvider>
    )
  })
}

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate)
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  window.setTimeout(hydrate, 1)
}
