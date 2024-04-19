import { requireCurrentUser } from '../models/auth.server'
import { type LoaderFunction, json } from '@remix-run/node'
import { useLoaderData, useNavigate } from '@remix-run/react'
import { fetchMyChallenges } from '~/models/challenge.server'
import { Button } from '@material-tailwind/react'
import CardChallenge from '~/components/cardChallenge'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import React, { useContext } from 'react'

export const loader: LoaderFunction = async (args) => {
  console.log('in my loader')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentUser = await requireCurrentUser(args)
  const result = await fetchMyChallenges(currentUser?.id) as { error?: string }
  if (!result || (result.error != null)) {
    const error = { loadingError: 'Unable to load challenges' }
    return json(error)
  }
  console.log(result)
  return json(result)
}

export default function ChallengesIndex (): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const navigate = useNavigate()
  const data: any = useLoaderData()
  console.log(data)
  if (data?.loadingError) {
    return <h1>{data.loadingError}</h1>
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
            {(data?.length) > 0 &&
               data.map((challenge: any) => (
                <p key={challenge.id}>
                  <CardChallenge challenge={challenge} isMember={challenge.isMember} />
                </p>
               ))
            }

          </div>
          </>
  )
}
