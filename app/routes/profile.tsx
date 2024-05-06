import { type LoaderFunction, type LoaderFunctionArgs, redirect } from '@remix-run/node'
import { UserProfile } from '@clerk/clerk-react'
import { getAuth } from '@clerk/remix/ssr.server'
import { ClerkLoading, ClerkLoaded } from '@clerk/remix'
import { useLoaderData } from '@remix-run/react'
import { useMobileSize } from '~/utils/useMobileSize'
export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  const auth = await getAuth(args)
  if (!auth.userId) {
    return redirect('/signin')
  }
  return auth
}

export default function Profile (): JSX.Element {
  const isMobile = useMobileSize()
  const data = useLoaderData()
  console.log('data', data)
  return (
    <div className={`${isMobile ? 'h-screen items-center justify-center ' : 'h-full pt-12 justify-start'} flex `}>
      <UserProfile
        path="/profile"
        routing="path"
        appearance={{
          variables: {
            colorPrimary: '#FABFC4',
            colorText: '#6b7280'
          },
          formButtonPrimary:
              'bg-slate-500 hover:bg-slate-400 text-sm normal-case'
        }}
        />
    </div>
  )
}
