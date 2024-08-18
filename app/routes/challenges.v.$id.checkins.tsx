import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction, json } from '@remix-run/node'
import { useLoaderData, useRevalidator, useRouteLoaderData, Outlet } from '@remix-run/react'
import { fetchCheckIns } from '~/models/challenge.server'
import { fetchChallengeCheckinComments } from '~/models/comment.server'
import type { Challenge, MemberChallenge } from '~/utils/types'
import { ChallengeMemberCheckin } from '~/components/challengeMemberCheckin'
import { useContext } from 'react'
import { CurrentUserContext } from '~/utils/CurrentUserContext'

import CheckinsList from '~/components/checkinsList'
import 'react-circular-progressbar/dist/styles.css'
import { likesByType } from '~/models/like.server'
export const loader: LoaderFunction = async (args) => {
  const currentUser = await requireCurrentUser(args)
  const userId = Number(args.params.userId ?? currentUser?.id)
  const challengeId = Number(args.params.id)
  const checkIns = await fetchCheckIns({ challengeId }) as { error?: string }
  const rawLikes = await likesByType({ userId }) || { comment: [] as number[] }
  const likes = rawLikes.comment
  const comments = await fetchChallengeCheckinComments(challengeId)

  return json({ checkIns, likes, comments })
}
export default function CheckIns (): JSX.Element {
  const revalidator = useRevalidator()
  const { currentUser } = useContext(CurrentUserContext)
  const { checkIns, error, likes, comments } = useLoaderData<typeof loader>()

  const { membership, challenge } = useRouteLoaderData<typeof useRouteLoaderData>('routes/challenges.v.$id') as { membership: MemberChallenge, challenge: Challenge }
  if (error) {
    return <h1>{error}</h1>
  }
  if (!membership && currentUser?.id !== challenge.userId) {
    return <p>Loading...</p>
  }
  return (
      <div className='flex flex-col items-start justify-center mt-4  w-full max-w-lg md:max-w-xl'>
        <Outlet />
        <ChallengeMemberCheckin showDetails={true} challenge={challenge} memberChallenge={membership} afterCheckIn={() => { revalidator.revalidate() }} />
        <div className='flex flex-col items-start justify-center mt-4  w-full'>
          <CheckinsList checkIns={checkIns} likes={likes} allowComments={true} comments={comments}/>
        </div>
    </div>
  )
}
