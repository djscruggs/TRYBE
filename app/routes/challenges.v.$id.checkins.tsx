import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction, json } from '@remix-run/node'
import { useLoaderData, useRevalidator, useRouteLoaderData, Outlet } from '@remix-run/react'
import { fetchCheckIns } from '~/models/challenge.server'
import type { Challenge, MemberChallenge } from '~/utils/types'
import { differenceInDays, format } from 'date-fns'
import { ChallengeMemberCheckin } from '~/components/challengeMemberCheckin'
import CheckinsList from '~/components/checkinsList'
import 'react-circular-progressbar/dist/styles.css'
import { fetchUserLikes } from '~/models/like.server'
export const loader: LoaderFunction = async (args) => {
  const currentUser = await requireCurrentUser(args)
  const userId = Number(args.params.userId ?? currentUser?.id)
  const challengeId = Number(args.params.id)
  const checkIns = await fetchCheckIns({ challengeId }) as { error?: string }
  const rawLikes = await fetchUserLikes(userId) || []
  console.log('in parent')
  const likes = rawLikes
    .map((like) => like.checkinId)
    .filter((id) => id !== undefined && id !== null)
  return json({ checkIns, likes })
}
export default function CheckIns (): JSX.Element {
  const revalidator = useRevalidator()
  const { checkIns, error, likes } = useLoaderData<typeof loader>()
  const { membership, challenge } = useRouteLoaderData<typeof useRouteLoaderData>('routes/challenges.v.$id') as { membership: MemberChallenge, challenge: Challenge }
  if (error) {
    return <h1>{error}</h1>
  }
  if (!membership) {
    return <p>Loading...</p>
  }
  return (
      <div className='flex flex-col items-start justify-center mt-4  w-full max-w-lg md:max-w-xl'>
        <Outlet />
        <ChallengeMemberCheckin showDetails={true} challenge={challenge} memberChallenge={membership} afterCheckIn={() => { revalidator.revalidate() }} />
        <div className='flex flex-col items-start justify-center mt-4  w-full'>
          <CheckinsList checkIns={checkIns} likes={likes} />
        </div>
    </div>
  )
}
