import React, { useContext } from 'react'
import ChallengeForm from '~/components/formChallenge'
import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction } from '@remix-run/node'
import { CurrentUserContext } from '~/utils/CurrentUserContext'

interface LoaderData {
  locale?: string
}
export const loader: LoaderFunction = async (args): Promise<LoaderData> => {
  await requireCurrentUser(args)
  return {}
}

export default function NewChallenge (): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const formData = { userId: currentUser?.id }
  return (
    <ChallengeForm object={formData}/>
  )
}
