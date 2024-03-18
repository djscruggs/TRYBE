import * as React from 'react'
import { useNavigate, useLoaderData } from '@remix-run/react'
import LayoutWeb from './layout-web'
import LayoutMobile from './layout-mobile'
import { ClientOnly } from 'remix-utils/client-only'
import { useMobileSize } from '../utils/useMobileSize'
import { ClerkProvider, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'

export default function Layout ({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <>

      <ClientOnly fallback={<Loading />}>
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
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
      <div className="text-white text-2xl font-bold">Loading...</div>
    </div>
  )
}
function ClerkAndLayout (): JSX.Element {
  const data = useLoaderData<typeof loader>()
  const isMobileSize = useMobileSize()
  const navigate = useNavigate()
  return (
        <ClerkProvider navigate={navigate} publishableKey={data.ENV.CLERK_PUBLISHABLE_KEY}>
          {isMobileSize ? <LayoutMobile /> : <LayoutWeb />}
        </ClerkProvider>)
}
