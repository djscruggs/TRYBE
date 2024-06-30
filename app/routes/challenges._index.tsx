import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction, json } from '@remix-run/node'
import { useLoaderData, useNavigate, useParams, useFetcher } from '@remix-run/react'
import { fetchChallengeSummaries, fetchUserChallengesAndMemberships } from '~/models/challenge.server'
import { fetchMemberChallenges } from '~/models/user.server'
import { fetchUserLikes } from '~/models/like.server'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { useContext, useEffect, useState } from 'react'
import ChallengeList from '~/components/challengeList'
import { Button } from '@material-tailwind/react'

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
  const memberships = await fetchMemberChallenges(uid) || []
  const rawLikes = await fetchUserLikes(uid) || []
  const likes = rawLikes
    .map((like) => like.challengeId)
    .filter((id) => id !== undefined && id !== null)
  return json({ challenges, memberships, error: null, likes })
}

export default function ChallengesIndex (): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
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
  useEffect(() => {
    fetcher.submit({ status }, {
      method: 'GET'
    })
  }, [status])
  return (

        <div className='flex items-center  max-w-xl'>
          <div className="flex flex-col items-center max-w-lg w-full">
            <h1 className="text-3xl font-bold mb-4 w-full">
              Challenges
            </h1>
            <p className="rounded-md p-4 bg-yellow">View your current challenges, browse upcoming challenges, or start your own!</p>
            {currentUser && <Button placeholder='Create a Challenge' size="sm" onClick={() => { navigate('./new') }} className="bg-red mb-4 mt-4">Create a Challenge</Button>}

            <div className="w-full">
              <div className='text-lg py-2 flex items-center justify-center w-full'>
                  <div className={`w-fit ${isActive ? 'border-b-2 border-red' : 'cursor-pointer'}`} onClick={() => { setStatus('active') }}>Active</div>
                  <div className={`w-fit mx-4 ${isUpcoming ? 'border-b-2 border-red' : 'cursor-pointer'}`} onClick={() => { setStatus('upcoming') }}>Upcoming</div>
                  <div className={`w-fit mr-4 ${isMine ? 'border-b-2 border-red' : 'cursor-pointer'}`} onClick={() => { setStatus('mine') }}>My Challenges</div>
                  <div className={`w-fit ${isArchived ? 'border-b-2 border-red' : 'cursor-pointer'}`} onClick={() => { setStatus('archived') }}>Archived</div>
              </div>

              <div className="flex flex-col items-center max-w-lg w-full">
                {fetcher.state === 'idle' && challenges.length === 0 &&
                  <div className="text-center mt-10">No {status !== 'mine' ? status : ''} challenges found</div>
                }
                <ChallengeList challenges={challenges} memberships={memberships} isLoading={fetcher.state === 'loading'} likes={likes} />
              </div>
          </div>
        </div>
      </div>
  )
}
