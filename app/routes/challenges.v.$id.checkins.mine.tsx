import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction, json } from '@remix-run/node'
import { useLoaderData, useRouteLoaderData } from '@remix-run/react'
import { fetchCheckIns } from '~/models/challenge.server'
import type { Challenge, MemberChallenge, CurrentUser } from '~/utils/types'
import { differenceInDays, format } from 'date-fns'
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar'
import { useContext } from 'react'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import 'react-circular-progressbar/dist/styles.css'
import { likesByType } from '~/models/like.server'
export const loader: LoaderFunction = async (args) => {
  const currentUser = await requireCurrentUser(args)
  const userId = Number(args.params.userId ?? currentUser?.id)
  const challengeId = Number(args.params.id)
  const checkIns = await fetchCheckIns({ userId, challengeId }) as { error?: string }
  const rawLikes = await likesByType({ userId }) || { checkin: [] as number[] }
  const likes = rawLikes.checkin
  return json({ checkIns, likes })
}
export default function MyCheckIns (): JSX.Element {
  const { checkIns, error } = useLoaderData<typeof loader>()
  const { membership, challenge } = useRouteLoaderData<typeof useRouteLoaderData>('routes/challenges.v.$id') as { membership: MemberChallenge, challenge: Challenge }
  const { currentUser } = useContext(CurrentUserContext)
  if (error) {
    return <h1>{error}</h1>
  }
  if (!membership && challenge.userId !== currentUser?.id) {
    return <></>
  }

  return (
    <div className='w-full flex items-center justify-center'>
        <div className='max-w-[200px] flex items-center justify-center'>
            <ChallengeMemberProgressChart challenge={challenge} checkIns={checkIns} />
        </div>
    </div>

  )
}

export function ChallengeMemberProgressChart ({ challenge, checkIns }: { challenge: Challenge, checkIns: Array<{ createdAt: string }> }): JSX.Element {
  const numDays = (challenge?.endAt && challenge.startAt) ? differenceInDays(challenge.endAt, challenge.startAt) : 0
  const typedCheckIns = checkIns as Array<{ createdAt: string }>
  const uniqueDays = new Set(typedCheckIns.map(checkIn => format(new Date(checkIn.createdAt), 'yyyy-MM-dd'))).size
  const progress = (uniqueDays / numDays) * 100
  return (
    <CircularProgressbarWithChildren
      value={progress}
      maxValue={numDays}

      strokeWidth={5}
      styles={buildStyles({
        textColor: 'red',
        pathColor: 'red'
      })}
    >
      <div className='text-center text-5xl text-red'>{uniqueDays} / {numDays}
      <div className='text-center text-xl text-gray-500'>Days</div>
      </div>
    </CircularProgressbarWithChildren>
  )
}
