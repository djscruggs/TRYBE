import React from 'react'
import { type LoaderFunction, type LoaderFunctionArgs, redirect } from '@remix-run/node'
import { UserProfile } from '@clerk/clerk-react'
import { getAuth } from '@clerk/remix/ssr.server'
import { ClerkLoading, ClerkLoaded } from '@clerk/remix'

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  const auth = await getAuth(args)
  console.log('userId', auth.userId)
  if (!auth.userId) {
    return redirect('/signin')
  }
  return auth
}

export default function Profile (): JSX.Element {
  return (
    <div className="h-full justify-center items-center flex flex-col">
      <ClerkLoading>
        <p>Loading...</p>
      </ClerkLoading>
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
