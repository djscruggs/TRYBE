import { requireCurrentUser } from '../models/auth.server'
import { type LoaderFunction, json } from '@remix-run/node'
import { useLoaderData, useNavigate } from '@remix-run/react'
import { fetchUserChallengesAndMemberships } from '~/models/challenge.server'
import { Button } from '@material-tailwind/react'
import CardChallenge from '~/components/cardChallenge'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import React, { useContext } from 'react'

export const loader: LoaderFunction = async (args) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentUser = await requireCurrentUser(args)
  const uid = Number(currentUser?.id)
  const challenges = await fetchUserChallengesAndMemberships(uid) as { error?: string }
  if (!challenges || (challenges.error != null)) {
    const error = { error: 'Unable to load challenges' }
    return json(error)
  }
  console.log('end of my loader')
  console.log(challenges)
  return json({ challenges })
}

export default function ChallengesIndex (): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const navigate = useNavigate()
  const data: any = useLoaderData()
  const { challenges } = data
  console.log(challenges)
  if (data?.error) {
    return <h1>{data.error}</h1>
  }
  if (!data) {
    return <p>Loading...</p>
  }
  return (
          <>
            <h1 className="text-3xl font-bold mb-4">
              My Challenges
            </h1>
            <div className="max-w-md">
            {currentUser && <Button placeholder='New Challenge' size="sm" onClick={() => { navigate('./new') }} className="bg-red mb-4 mt-4">New</Button>}
            {(challenges.length) > 0 &&
               challenges.map((challenge: any) => (
                <p key={challenge.id}>
                  <CardChallenge challenge={challenge} isMember={challenge.isMember} />
                </p>
               ))
            }

          </div>
          </>
  )
}
