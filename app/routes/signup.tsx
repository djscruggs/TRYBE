import React from 'react'
import { SignUp } from '@clerk/remix'

export default function SignUpPage (): JSX.Element {
  return (
    <div>
      <h1>Sign Up route</h1>
      <SignUp />
    </div>
  )
}
