import * as ReactDOMServer from 'react-dom/server'
import { ServerRouter } from 'react-router';
import type { EntryContext } from 'react-router';
import createEmotionCache from './createEmotionCache'
import { CacheProvider } from '@emotion/react'
import createEmotionServer from '@emotion/server/create-instance'
import * as Sentry from '@sentry/remix'
import { wrapRemixHandleError } from '@sentry/remix'

export const handleError = wrapRemixHandleError
Sentry.init({
  environment: process.env.NODE_ENV,
  dsn: 'https://4f3a1762974e77da7b1e347738080185@o4506538845929472.ingest.us.sentry.io/4506538846126080',
  tracesSampleRate: 1.0
})
export default function handleRequest (
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext
): Response {
  const cache = createEmotionCache()
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { extractCriticalToChunks } = createEmotionServer(cache)

  function MuiRemixServer (): JSX.Element {
    return (
      (<CacheProvider value={cache}>
        <ServerRouter context={reactRouterContext} url={request.url} />
      </CacheProvider>)
    );
  }

  // Render the component to a string.
  const html = ReactDOMServer.renderToString(<MuiRemixServer />)

  // Grab the CSS from emotion
  const { styles } = extractCriticalToChunks(html)

  let stylesHTML = ''

  styles.forEach(({ key, ids, css }) => {
    const emotionKey = `${key} ${ids.join(' ')}`
    const newStyleTag = `<style data-emotion="${emotionKey}">${css}</style>`
    stylesHTML = `${stylesHTML}${newStyleTag}`
  })

  // Add the Emotion style tags after the insertion point meta tag
  const markup = html.replace(
    /<meta(\s)*name="emotion-insertion-point"(\s)*content="emotion-insertion-point"(\s)*\/>/,
    `<meta name="emotion-insertion-point" content="emotion-insertion-point"/>${stylesHTML}`
  )
  const allowedOrigins = [
    'http://localhost:3000',
    'https://app.jointhetrybe.com',
    'http://localhost:8100',
    'http://192.168.0.144:8100'
  ]
  const origin = request.headers.get('Origin')

  if (origin && allowedOrigins.includes(origin)) {
    responseHeaders.set('Access-Control-Allow-Origin', origin)
  } else {
    responseHeaders.set('Access-Control-Allow-Origin', 'http://localhost:3000') // default
  }
  responseHeaders.set('Content-Type', 'text/html')
  responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  responseHeaders.set('Access-Control-Allow-Credentials', 'true')

  return new Response(`<!DOCTYPE html>${markup}`, {
    status: responseStatusCode,
    headers: responseHeaders
  })
}
