import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction, type MetaFunction, json } from '@remix-run/node'
import { useLoaderData, useRouteLoaderData } from '@remix-run/react'
import { fetchCheckIns } from '~/models/challenge.server'
import type { Challenge, MemberChallenge } from '~/utils/types'
import CheckinsList from '~/components/checkinsList'
import { differenceInDays, format } from 'date-fns'
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar'
import { useContext } from 'react'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { CheckInButton } from '~/components/checkinButton'

import 'react-circular-progressbar/dist/styles.css'
export const loader: LoaderFunction = async (args) => {
  const currentUser = await requireCurrentUser(args)
  const userId = Number(args.params.userId ?? currentUser?.id)
  const challengeId = Number(args.params.id)
  const checkIns = await fetchCheckIns({ userId, challengeId }) as { error?: string }
  return json({ checkIns })
}
export const meta: MetaFunction = () => {
  return [
    { title: 'Checkins' },
    {
      property: 'og:title',
      content: 'Checkins'
    }
  ]
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
    <div className='flex flex-col items-start justify-center mt-4  w-full max-w-lg md:max-w-xl'>
      <div className='w-full flex items-center justify-center mb-8'>
        <div className='max-w-[200px] flex-col items-center justify-center'>
            <ChallengeMemberProgressChart challenge={challenge} checkIns={checkIns} />
            <div className='mt-4 flex items-center justify-center'>
              <CheckInButton challenge={challenge} membership={membership} />
            </div>
        </div>

      </div>
      <CheckinsList checkIns={checkIns} allowComments={false} posts={[]} newestComment={null}/>
    </div>
  )
}

export function ChallengeMemberProgressChart ({ challenge, checkIns }: { challenge: Challenge, checkIns: Array<{ createdAt: string }> }): JSX.Element {
  const numDays = (challenge?.endAt && challenge.startAt) ? differenceInDays(challenge.endAt, challenge.startAt) : 0
  const typedCheckIns = checkIns as Array<{ createdAt: string }>
  const uniqueDays = new Set(typedCheckIns.map(checkIn => format(new Date(checkIn.createdAt), 'yyyy-MM-dd'))).size
  const progress = (uniqueDays / numDays) * 100
  return (
    <div className='flex flex-col items-center justify-center'>
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

    </div>
  )
}
