import ChallengeForm from '~/components/formChallenge'
import React, { useMatches } from '@remix-run/react'
import { type ObjectData } from '~/utils/types'

export default function EditChallenge (): JSX.Element {
  const matches = useMatches()
  // based on https://jankraus.net/2022/04/16/access-remix-route-data-in-other-routes/
  const { loadingError, challenge, locale } = matches.find((match) => match.id === 'routes/challenges.v.$id')?.data as ObjectData
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
