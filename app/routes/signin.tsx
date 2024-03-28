import React from 'react'
import { type LoaderFunction, type LoaderFunctionArgs, redirect } from '@remix-run/node'
import { SignIn } from '@clerk/clerk-react'
import { getAuth } from '@clerk/remix/ssr.server'

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  const { userId } = await getAuth(args)
  console.log('userId', userId)
  if (userId) {
    // return redirect('/')

  }
  return null
}

export default function SignInPage (): JSX.Element {
  console.log('in signing')
  return (
    <div className="h-full justify-center items-center flex flex-col gap-y-4">

      <SignIn
      appearance={{
        elements: {
          formButtonPrimary:
            'bg-red hover:bg-yellow text-sm normal-case'
        }
      }}
      />
    </div>
  )
}
