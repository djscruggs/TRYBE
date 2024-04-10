
import * as ReactDOM from 'react-dom/client'
import { RemixBrowser } from '@remix-run/react'
import { CacheProvider } from '@emotion/react'
import ClientStyleContext from './ClientStyleContext'
import createEmotionCache from './createEmotionCache'
import { ThemeProvider } from '@material-tailwind/react'

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
