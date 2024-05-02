import { json, type ActionFunction, type LoaderFunction } from '@remix-run/node'

// based on https://docs.sentry.io/platforms/javascript/troubleshooting/#dealing-with-ad-blockers
const SENTRY_HOST = 'o4506538845929472.ingest.us.sentry.io'
const SENTRY_PROJECT_IDS = ['4506538846126080']

export const action: ActionFunction = async (args) => {
  console.log(args)
  const { request } = args
  try {
    const envelope = await request.text()
    const piece = envelope.split('\n')[0]
    const header = JSON.parse(piece)
    const dsn = new URL(String(header.dsn))
    const projectId = dsn.pathname?.replace('/', '')

    if (dsn.hostname !== SENTRY_HOST) {
      throw new Error(`Invalid sentry hostname: ${dsn.hostname}`)
    }

    if (!projectId || !SENTRY_PROJECT_IDS.includes(projectId)) {
      throw new Error(`Invalid sentry project id: ${projectId}`)
    }

    const upstreamSentryUrl = `https://${SENTRY_HOST}/api/${projectId}/envelope/`
    await fetch(upstreamSentryUrl, { method: 'POST', body: envelope })

    return json({}, { status: 200 })
  } catch (e) {
    console.error('error tunneling to sentry', e)
    return json({ error: 'error tunneling to sentry' }, { status: 500 })
  }
}
export const loader: LoaderFunction = async () => {
  return json({ message: 'This route does not accept GET requests' }, 200)
}
