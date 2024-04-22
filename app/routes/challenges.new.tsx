import React, { useContext } from 'react'
import ChallengeForm from '~/components/formChallenge'
import { requireCurrentUser } from '../models/auth.server'
import { type LoaderFunction } from '@remix-run/node'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import getUserLocale from 'get-user-locale'
import { useLoaderData } from '@remix-run/react'

interface LoaderData {
  locale?: string
}
export const loader: LoaderFunction = async (args): Promise<LoaderData> => {
  await requireCurrentUser(args)
  // if thecurrentUser isn't authenticated, this will redirect to login
  const locale = getUserLocale()
  return { locale }
}

export default function NewChallenge (): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const { locale } = useLoaderData<LoaderData>()
  const formData = { userId: currentUser?.id }
  return (
    <ChallengeForm object={formData} locale={locale}/>
  )
}
