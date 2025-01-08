import * as ReactDOMServer from 'react-dom/server'
import { RemixServer } from '@remix-run/react'
import type { EntryContext } from '@remix-run/node'
import createEmotionCache from './createEmotionCache'
import { CacheProvider } from '@emotion/react'
import createEmotionServer from '@emotion/server/create-instance'
import * as Sentry from '@sentry/remix'
import { wrapRemixHandleError } from '@sentry/remix'
import type { EventHint, Event } from '@sentry/browser'
import { isCancel } from 'axios'

// based on https://github.com/axios/axios/issues/6209
function handleSentryBeforeSend (event: Event, hint: EventHint): Event | null {
  if (isCancel(hint?.originalException)) {
    console.debug('Cancelled request ignored by Sentry', hint.originalException)
    return null
  }
  return event
}

export const handleError = wrapRemixHandleError
Sentry.init({
  environment: process.env.NODE_ENV,
  dsn: 'https://4f3a1762974e77da7b1e347738080185@o4506538845929472.ingest.us.sentry.io/4506538846126080',
  tracesSampleRate: 1.0,
  beforeSend: handleSentryBeforeSend
})
export default function handleRequest (
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
): Response {
  const cache = createEmotionCache()
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { extractCriticalToChunks } = createEmotionServer(cache)

  function MuiRemixServer (): JSX.Element {
    return (
      <CacheProvider value={cache}>
        <RemixServer context={remixContext} url={request.url} />
      </CacheProvider>
    )
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

  responseHeaders.set('Content-Type', 'text/html')

  return new Response(`<!DOCTYPE html>${markup}`, {
    status: responseStatusCode,
    headers: responseHeaders
  })
}
