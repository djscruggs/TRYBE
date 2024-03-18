import { requireCurrentUser } from '../models/auth.server'
import { type LoaderFunction, json, type LoaderFunctionArgs } from '@remix-run/node'
import { loadUserCreatedChallenges } from '~/models/challenge.server'
import React from 'react'
import { UserProfile } from '@clerk/clerk-react'
export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  const currentUser = await requireCurrentUser(args)
  const result = await loadUserCreatedChallenges(currentUser?.id)
  if (!result) {
    const error = { loadingError: 'Unable to load challenges' }
    return json(error)
  }
  return json(result)
}

export default function Profile (): JSX.Element {
  return (
      <>
      <h1>Profile</h1>
      <UserProfile
        path="/profile"
        routing="path"
        appearance={{
          variables: {
            colorPrimary: '#FABFC4',
            colorText: '#6b7280'
          }
        }}
        />
      </>
  )
}
