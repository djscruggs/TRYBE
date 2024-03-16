import React from 'react'
import { SignIn } from '@clerk/remix'

export default function SignInPage (): JSX.Element {
  return (
    <div>
      <h1>Sign In route</h1>
      <SignIn />
    </div>
  )
}
