import { requireCurrentUser } from '../models/auth.server'
import { type LoaderFunction, json } from '@remix-run/node'
import { useLoaderData, useNavigate } from '@remix-run/react'
import { fetchChallengeSummaries } from '~/models/challenge.server'
import { fetchMemberChallenges } from '~/models/user.server'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import React, { useContext, useEffect, useState } from 'react'
import ChallengeList from '~/components/challengeList'
import { Button } from '@material-tailwind/react'
import axios from 'axios'

export const loader: LoaderFunction = async (args) => {
  const { params } = args
  console.log('loader params', params)
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

export const clientLoader: LoaderFunction = async ({
  request,
  params,
  serverLoader
}: ClientLoaderFunctionArgs) => {
  console.log('clientLoader params', params)
  const serverData = await serverLoader({ params })
  // During client-side navigations, we hit our exposed API endpoints directly
  // const data = await axios.get(url)
  return serverData
}
export default function ChallengesIndex (): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const data: any = useLoaderData<typeof clientLoader>()
  const { challenges, memberships, error } = data
  const [status, setStatus] = useState('active')
  const navigate = useNavigate()
  const isActive = status === 'active'
  const isUpcoming = status === 'upcoming'
  const isArchived = status === 'archived'
  if (error) {
    return <h1>{error}</h1>
  }
  if (!data) {
    return <p>Loading...</p>
  }
  useEffect(() => {
    void reload({ status })
  }, [status])

  const reload = async ({ status }: { status: string }) => {
    console.log('useEffect', loader)
    const params = { status }
    return await clientLoader({ params })
  }
  return (
        <div className='flex items-center  max-w-xl'>
          <div className="flex flex-col items-center max-w-lg w-full">
            <h1 className="text-3xl font-bold mb-4 w-full">
              Challenges
            </h1>
            <p className=" rounded-md p-4 bg-yellow">View your current challenges, browse upcoming challenges, or start your own!</p>
            {currentUser && <Button placeholder='Create a Challenge' size="sm" onClick={() => { navigate('./new') }} className="bg-red mb-4 mt-4">Create a Challenge</Button>}
            <div className="w-full">
              <div className='text-lg py-2 flex items-center justify-center w-full'>
                  <div className={`w-fit ${isActive ? 'border-b-2 border-red' : 'cursor-pointer'}`} onClick={() => { setStatus('active') }}>Active</div>
                  <div className={`w-fit mx-8 ${isUpcoming ? 'border-b-2 border-red' : 'cursor-pointer'}`} onClick={() => { setStatus('upcoming') }}>Upcoming</div>
                  <div className={`w-fit ${isArchived ? 'border-b-2 border-red' : 'cursor-pointer'}`} onClick={() => { setStatus('archived') }}>Archived</div>
              </div>
              <div className="flex flex-col items-center max-w-lg w-full">
                <ChallengeList challenges={challenges} memberships={memberships} />
              </div>
          </div>
        </div>
      </div>
  )
}
