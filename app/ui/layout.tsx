import * as React from 'react'
import { useLoaderData } from '@remix-run/react'
import LayoutWeb from './layout-web'
import { ClientOnly } from 'remix-utils/client-only'
import { ClerkProvider } from '@clerk/clerk-react'
import useHasLoaded from '../utils/useHasLoaded'
export default function Layout (): JSX.Element {
  const hasLoaded = useHasLoaded()
  if (!hasLoaded) {
    return <Loading />
  }
  return (
    <>

      <ClientOnly >
        {/* Rendering clerk in ClientOnly requires a function
          @see https://remix.run/resources/remix-utils#clientonly
         */}
        {() => <ClerkAndLayout />}

      </ClientOnly>

    </>
  )
}

function Loading (): JSX.Element {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex flex-col justify-center items-center bg-black bg-opacity-40">
      <div className='text-2xl text-white mb-4'>Loading TRYBE...</div>
      <div><img src="/logo.png" alt="TRYBE" height="100" width="100" className='block'/></div>
    </div>
  )
}
function ClerkAndLayout (): JSX.Element {
  const data = useLoaderData()
  return (
        <ClerkProvider publishableKey={data.ENV.CLERK_PUBLISHABLE_KEY} signInUrl='/signin'>
          <LayoutWeb />
        </ClerkProvider>
  )
}
