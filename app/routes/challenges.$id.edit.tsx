import ChallengeForm from '~/components/formChallenge'
import React, { useMatches } from '@remix-run/react'
import { type ObjectData } from '~/utils/types'

export default function EditChallenge (): JSX.Element {
  const matches = useMatches()
  // based on https://jankraus.net/2022/04/16/access-remix-route-data-in-other-routes/
  const data: ObjectData = matches.find((match) => match.id === 'routes/challenges.$id')?.data
  if (data?.loadingError) {
    return <h1>{data.loadingError}</h1>
  }

  if (!data?.challenge) {
    return <p>Loading.</p>
  }
  return (
    <ChallengeForm challenge={data.challenge}/>
  )
}
