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
import type { LinksFunction, LoaderFunction, LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { type User } from './utils/types.client'
import { Toaster, toast } from 'react-hot-toast'
import { getUser } from './models/auth.server'
import { getUserByClerkId } from './models/user.server'
import { rootAuthLoader } from '@clerk/remix/ssr.server'
import { ClerkApp } from '@clerk/remix'
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
export const loader: LoaderFunction = async args => {
  const ENV = {
    CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY
  }
  return await rootAuthLoader(args, async ({ request }) => {
    const auth = request.auth
    if (auth?.userId) {
      const user = await getUserByClerkId(auth.userId)
      return { user, auth, ENV }
    }
    return { ENV }
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
  const { user } = useLoaderData<{ user: User }>()
  const [currentUser, setCurrentUser] = useState<User | null>(user)
  useEffect(() => {
    setCurrentUser(user)
  }, [user])
  return (
    <Document>

      <CurrentUserContext.Provider value={{ currentUser, setCurrentUser }}>
        <Toaster position='top-center' />
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
        throw new Error(error.data || error.statusText)
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
          <div>
            <h1>There was an error</h1>
            <p>{error.message}</p>
            <hr />
            <p>Hey, developer, you should replace this with what you want yourcurrentUsers to see.</p>
          </div>

      </Document>
    )
  }

  return <h1>Unknown Error</h1>
}
