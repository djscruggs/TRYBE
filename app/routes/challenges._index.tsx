import { requireCurrentUser } from '../models/auth.server'
import { type LoaderFunction, json } from '@remix-run/node'
import { Link, useLoaderData, useNavigate } from '@remix-run/react'
import { fetchChallengeSummaries } from '~/models/challenge.server'
import { fetchMemberChallenges } from '~/models/user.server'
import { Button } from '@material-tailwind/react'
import CardChallenge from '~/components/cardChallenge'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import React, { useContext } from 'react'

export const loader: LoaderFunction = async (args) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentUser = await requireCurrentUser(args)
  const uid = Number(currentUser?.id)
  const challenges = await fetchChallengeSummaries(uid) as { error?: string }
  if (!challenges || (challenges.error != null)) {
    const error = { loadingError: 'Unable to load challenges' }
    return json(error)
  }
  const memberships = await fetchMemberChallenges(uid) || []
  return json({ challenges, memberships, error: null })
}

export default function ChallengesIndex (): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const data: any = useLoaderData<{ challenges: any[], memberships: any[], error: any }>()
  const { challenges, memberships, error } = data
  const navigate = useNavigate()
  if (error) {
    return <h1>{error}</h1>
  }
  if (!data) {
    return <p>Loading...</p>
  }
  function isMember (challenge: any): boolean {
    return memberships.some((membership: any) => membership.challengeId === challenge.id)
  }
  return (
          <>
            <h1 className="text-3xl font-bold mb-4">
              Challenges
            </h1>
            <div className="max-w-md">
            <p className="border border-red rounded-md p-4 bg-yellow">We celebrate the power of challenges to help focus, structure and kickstart our growth. When you don't have to do the heavy lifting of planning, scheduling and tracking, you can focus on just showing up, and that's where the magic and self-discovery unfolds!</p>
            {currentUser && <Button placeholder='Create a Challenge' size="sm" onClick={() => { navigate('./new') }} className="bg-red mb-4 mt-4">Create a Challenge</Button>}
            {challenges?.length > 0 &&
               challenges.map((challenge: any) => (
                <p key={challenge.id}>
                  <CardChallenge challenge={challenge} isMember={isMember(challenge)} />
                </p>
               ))
            }

          </div>
          </>
  )
}
