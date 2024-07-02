import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction, json } from '@remix-run/node'
import { useLoaderData, useRevalidator, useRouteLoaderData } from '@remix-run/react'
import { fetchCheckIns } from '~/models/challenge.server'
import type { Challenge, MemberChallenge } from '~/utils/types'
import { differenceInDays, format } from 'date-fns'
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar'
import { ChallengeMemberCheckin } from '~/components/challengeMemberCheckin'
import CheckinsList from '~/components/checkinsList'
import 'react-circular-progressbar/dist/styles.css'
import { fetchUserLikes } from '~/models/like.server'
export const loader: LoaderFunction = async (args) => {
  const currentUser = await requireCurrentUser(args)
  const userId = Number(args.params.userId ?? currentUser?.id)
  const challengeId = Number(args.params.id)
  const checkIns = await fetchCheckIns(userId, challengeId) as { error?: string }
  const rawLikes = await fetchUserLikes(userId) || []
  const likes = rawLikes
    .map((like) => like.checkinId)
    .filter((id) => id !== undefined && id !== null)
  return json({ checkIns, likes })
}
export default function CheckIns (): JSX.Element {
  const revalidator = useRevalidator()
  const { checkIns, error, likes } = useLoaderData<typeof loader>()
  const { membership, challenge } = useRouteLoaderData<typeof useRouteLoaderData>('routes/challenges.v.$id') as { membership: MemberChallenge, challenge: Challenge }
  const numDays = differenceInDays(challenge.endAt, challenge.startAt)
  if (error) {
    return <h1>{error}</h1>
  }
  if (!membership) {
    return <p>Loading...</p>
  }
  const uniqueDays = new Set(checkIns.map(checkIn => format(new Date(checkIn.createdAt), 'yyyy-MM-dd'))).size
  const progress = (uniqueDays / numDays) * 100
  return (
        <div className='max-w-sm md:max-w-xl lg:max-w-2xl mt-10 flex flex-col items-center md:items-start'>
          <div className='max-w-[200px] flex items-center justify-center'>
            <CircularProgressbarWithChildren
              value={progress}
              maxValue={numDays}

              strokeWidth={5}
              styles={buildStyles({
                textColor: 'red',
                pathColor: 'red'
              })}
            >
              <div className='text-center text-5xl text-red'>{checkIns.length} / {numDays}
              <div className='text-center text-xl text-gray-500'>Days</div>
              </div>
            </CircularProgressbarWithChildren>
          </div>
          <ChallengeMemberCheckin showDetails={true} challenge={challenge} memberChallenge={membership} afterCheckIn={() => { revalidator.revalidate() }} />
          <div className='flex flex-col items-start justify-center mt-4  w-full'>

            <CheckinsList checkIns={checkIns} likes={likes} />

          </div>
        </div>
  )
}
