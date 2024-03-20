import React from 'react'
import { type LoaderFunction, type LoaderFunctionArgs, redirect } from '@remix-run/node'
import { SignUp } from '@clerk/clerk-react'
import { getAuth } from '@clerk/remix/ssr.server'

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  const { userId } = await getAuth(args)
  console.log('userId', userId)
  if (userId) {
    return redirect('/home')
  }
  return null
}
export default function SignUpPage (): JSX.Element {
  console.log('SignUpPage')
  return (
    <div className="h-full border border-red justify-center items-center flex flex-col gap-y-4">
      <SignUp
      appearance={{
        variables: {
          colorPrimary: '#FABFC4',
          colorText: '#6b7280'
        },
        elements: {
          formButtonPrimary:
            'bg-red hover:bg-slate-400 text-sm normal-case'
        }
      }}
      />
    </div>
  )
}
