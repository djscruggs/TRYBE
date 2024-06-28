import { requireCurrentUser } from '../models/auth.server'
import { type LoaderFunction, json } from '@remix-run/node'
import { useLoaderData, useNavigate, useParams, useFetcher } from '@remix-run/react'
import { fetchChallengeSummaries } from '~/models/challenge.server'
import { fetchMemberChallenges } from '~/models/user.server'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import React, { useContext, useEffect, useState } from 'react'
import ChallengeList from '~/components/challengeList'
import { Button, Spinner } from '@material-tailwind/react'

export const loader: LoaderFunction = async (args) => {
  const { params } = args
  const { searchParams } = new URL(args.request.url)
  const status = searchParams.get('status') ?? 'active'
  console.log('loader status', status)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentUser = await requireCurrentUser(args)
  const uid = Number(currentUser?.id)
  const challenges = await fetchChallengeSummaries(uid, status) as { error?: string }
  console.log('challenges count', challenges.length)
  if (!challenges || (challenges.error != null)) {
    const error = { loadingError: 'Unable to load challenges' }
    return json(error)
  }
  const memberships = await fetchMemberChallenges(uid) || []
  return json({ challenges, memberships, error: null })
}

export default function ChallengesIndex (): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const fetcher = useFetcher()
  const data: any = useLoaderData<typeof loader>()

  const { memberships, error, challenges } = fetcher.data || data
  const params = useParams()
  const [status, setStatus] = useState(params.status ?? 'active')
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
    fetcher.submit({ status }, {
      method: 'GET'
    })
    console.log(fetcher)
  }, [status])
  console.log('fetcher state', fetcher.state)
  return (
        <div className='flex items-center  max-w-xl'>
          <div className="flex flex-col items-center max-w-lg w-full">
            <h1 className="text-3xl font-bold mb-4 w-full">
              Challenges {fetcher.state === 'loading' && (
              <Spinner className='inline'/>
            )}
            </h1>
            <p className="rounded-md p-4 bg-yellow">View your current challenges, browse upcoming challenges, or start your own!</p>
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
