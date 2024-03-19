import React, { useContext } from 'react'
import ChallengeForm from '~/components/form-challenge'
import { requireCurrentUser } from '../models/auth.server'
import { type LoaderFunction } from '@remix-run/node'
import { CurrentUserContext } from '../utils/CurrentUserContext'

export const loader: LoaderFunction = async (args) => {
  // if thecurrentUser isn't authenticated, this will redirect to login
  return await requireCurrentUser(args)
}

export default function NewChallenge () {
  const { currentUser } = useContext(CurrentUserContext)
  const formData = { userId: currentUser?.id }
  return (
    <ChallengeForm object={formData}/>
  )
}
