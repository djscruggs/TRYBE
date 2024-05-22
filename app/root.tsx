import * as React from 'react'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
  useLoaderData
} from '@remix-run/react'
import { withEmotionCache } from '@emotion/react'
import { useEffect, useState } from 'react'
import { CurrentUserContext } from './utils/CurrentUserContext'
import Layout from './ui/layout'
import stylesheet from './output.css'
import datepickerStyle from 'react-datepicker/dist/react-datepicker.css'
import type { LinksFunction, LoaderFunction, MetaFunction } from '@remix-run/node'
import { type CurrentUser } from './utils/types'
import { Toaster } from 'react-hot-toast'
import getUserLocale from 'get-user-locale'
import { getUserByClerkId } from './models/user.server'
import { rootAuthLoader } from '@clerk/remix/ssr.server'
import { ClerkApp } from '@clerk/remix'
import { captureRemixErrorBoundaryError } from '@sentry/remix'

interface DocumentProps {
  children: React.ReactNode
  title?: string
}

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet },
  { rel: 'stylesheet', href: datepickerStyle }

]
export const meta: MetaFunction = () => {
  return [
    { title: 'Trybe' },
    { viewport: 'width=device-width,initial-scale=1' }
  ]
}
export interface RootLoaderData {
  ENV: {
    CLERK_PUBLISHABLE_KEY: string
    NODE_ENV: string
  }
  user: CurrentUser | null
  auth: typeof rootAuthLoader
}
export const loader: LoaderFunction = async args => {
  const userLocale = getUserLocale()
  const ENV = {
    CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
    NODE_ENV: process.env.NODE_ENV
  }
  return await rootAuthLoader(args, async ({ request }) => {
    const auth = request.auth
    if (auth?.userId) {
      const user: CurrentUser = await getUserByClerkId(auth.userId)
      if (!user) {
        return { user: null, auth: null, ENV }
      }
      user.locale = userLocale
      user.dateFormat = user.locale === 'en-US' ? 'M-dd-yyyy' : 'dd-M-yyyy'
      user.timeFormat = user.locale === 'en-US' ? 'h:mm a' : 'HH:MM'
      user.dateTimeFormat = `${user.dateFormat} @ ${user.timeFormat}`
      return { user, auth, ENV }
    }
    return { ENV, user: null, auth: null }
  })
}
const Document = withEmotionCache(({ children, title }: DocumentProps, emotionCache) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {title ? <title>{title}</title> : null}
        <Meta />
        <Links />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap"
        />
        <meta name="emotion-insertion-point" content="emotion-insertion-point" />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
})

// https://remix.run/docs/en/main/route/component
// https://remix.run/docs/en/main/file-conventions/routes
function App (): JSX.Element {
  const { user } = useLoaderData<{ user: CurrentUser }>()
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(user as CurrentUser)
  useEffect(() => {
    setCurrentUser(user as CurrentUser)
  }, [user])
  return (
    <Document>

        <Toaster position='top-center' />
        <CurrentUserContext.Provider value={{ currentUser, setCurrentUser }}>
        <Layout>
          <Outlet />
        </Layout>
        </CurrentUserContext.Provider>

    </Document>
  )
}
export default ClerkApp(App)

// https://remix.run/docs/en/main/route/error-boundary
export function ErrorBoundary (): JSX.Element {
  const error = useRouteError()
  captureRemixErrorBoundaryError(error)
  if (isRouteErrorResponse(error)) {
    let message
    switch (error.status) {
      case 401:
        message = <p>Oops! Looks like you tried to visit a page that you do not have access to.</p>
        break
      case 404:
        message = <p>Oops! Looks like you tried to visit a page that does not exist.</p>
        break

      default:
        throw new Error(`Unhandled error.status: ${error.status}: ${error.data || error.statusText}`)
    }

    return (

     <Document title={`${error.status} ${error.statusText}`}>
      <div className="flex flex-col justify-start items-start mr-8">
      <h1>
        {error.status}: {error.statusText}
      </h1>
      {message}
      </div>
      </Document>

    )
  }

  if (error instanceof Error) {
    console.error(error)
    return (
      <Document title="Error!">
          <div style={{ margin: '100px', padding: '25%' }}>
            <h1 style={{ fontSize: '1rem', color: 'red' }}>There was an error</h1>
            <p style={{ fontSize: '2rem' }}>{error.message}</p>

          </div>

      </Document>
    )
  }

  return <h1>Unknown Error</h1>
}
