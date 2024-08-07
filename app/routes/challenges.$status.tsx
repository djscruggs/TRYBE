import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction, json } from '@remix-run/node'
import { useLoaderData, useNavigate, useParams, useFetcher } from '@remix-run/react'
import { fetchChallengeSummaries, fetchUserChallengesAndMemberships } from '~/models/challenge.server'
import { fetchMemberChallenges } from '~/models/user.server'
import { likesByType } from '~/models/like.server'
import { useEffect, useState } from 'react'
import ChallengeList from '~/components/challengeList'

export const loader: LoaderFunction = async (args) => {
  const { searchParams } = new URL(args.request.url)
  const status = searchParams.get('status') ?? 'active'
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentUser = await requireCurrentUser(args)
  const uid = Number(currentUser?.id)
  let challenges
  if (status === 'mine') {
    challenges = await fetchUserChallengesAndMemberships(uid) as { error?: string }
  } else {
    challenges = await fetchChallengeSummaries(uid, status) as { error?: string }
  }
  if (!challenges || (challenges.error != null)) {
    const error = { loadingError: 'Unable to load challenges' }
    return json(error)
  }
  const memberships = await fetchMemberChallenges(uid) || [] as number[]
  const rawLikes = await likesByType({ userId: uid }) || { challenge: [] as number[] }
  const likes = rawLikes.challenge
  return json({ challenges, memberships, error: null, likes })
}

export default function ChallengesIndex (): JSX.Element {
  const fetcher = useFetcher()
  const data: any = useLoaderData<typeof loader>()

  const { memberships, error, challenges, likes } = fetcher.data || data
  const params = useParams()
  const [status, setStatus] = useState(params.status ?? 'active')
  const navigate = useNavigate()
  const isActive = status === 'active'
  const isUpcoming = status === 'upcoming'
  const isArchived = status === 'archived'
  const isMine = status === 'mine'
  if (error) {
    return <h1>{error}</h1>
  }
  if (!data) {
    return <p>Loading...</p>
  }
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus)
    navigate(`/challenges/${newStatus}`)
  }
  useEffect(() => {
    fetcher.submit({ status }, {
      method: 'GET'
    })
  }, [status])
  return (

            <div className="w-full">
              <div className='text-lg py-2 flex items-center justify-center w-full relative'>
                  <div className={`w-fit ${isActive ? 'border-b-2 border-red' : 'cursor-pointer'}`} onClick={() => { handleStatusChange('active') }}>Active</div>
                  <div className={`w-fit mx-8 ${isUpcoming ? 'border-b-2 border-red' : 'cursor-pointer'}`} onClick={() => { handleStatusChange('upcoming') }}>Upcoming</div>
                  <div className={`w-fit mr-8 ${isMine ? 'border-b-2 border-red' : 'cursor-pointer'}`} onClick={() => { handleStatusChange('mine') }}>Hosting</div>
                  <div className={`absolute right-2 text-xs text-gray-500 underline cursor-pointer ${isArchived ? 'text-red' : ''}`} onClick={() => { navigate('/challenges/archived') }}>Archived</div>

              </div>
              <div className="flex flex-col items-center max-w-lg w-full">
                {fetcher.state === 'idle' && challenges.length === 0 &&
                  <div className="text-center mt-10">No {status !== 'mine' ? status : ''} challenges found</div>
                }
                <ChallengeList challenges={challenges} memberships={memberships} isLoading={fetcher.state === 'loading'} likes={likes} />
              </div>
          </div>

  )
}
