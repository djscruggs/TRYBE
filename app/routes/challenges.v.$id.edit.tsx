import ChallengeForm from '~/components/formChallenge'
import React, { useRouteLoaderData } from '@remix-run/react'
import { type ObjectData } from '~/utils/types'

export default function EditChallenge (): JSX.Element {
  const { challenge, locale, loadingError } = useRouteLoaderData<typeof useRouteLoaderData>('routes/challenges.v.$id') as ObjectData
  if (loadingError) {
    return <h1>{loadingError}</h1>
  }
  if (!challenge) {
    return <p>Loading.</p>
  }
  return (
    <ChallengeForm challenge={challenge} locale={locale}/>
  )
}
