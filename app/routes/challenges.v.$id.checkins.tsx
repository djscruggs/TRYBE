import { type MetaFunction, useRouteLoaderData } from '@remix-run/react'
import type { Challenge, CheckIn, MemberChallenge } from '~/utils/types'
import CheckinsList from '~/components/checkinsList'
import { differenceInDays, format } from 'date-fns'
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar'
import { useContext, useEffect, useState } from 'react'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { CheckInButton } from '~/components/checkinButton'
import axios from 'axios'
import { Spinner } from '@material-tailwind/react'
import 'react-circular-progressbar/dist/styles.css'

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
  const { membership, challenge } = useRouteLoaderData<typeof useRouteLoaderData>('routes/challenges.v.$id') as { membership: MemberChallenge, challenge: Challenge }
  const { currentUser } = useContext(CurrentUserContext)
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [isLoading, setIsLoading] = useState(true)
  if (!membership && challenge.userId !== currentUser?.id) {
    return <></>
  }
  const fetchCheckIns = async (): Promise<void> => {
    setIsLoading(true)
    const response = await axios.get(`/api/checkins/${challenge.id}/${currentUser?.id}`)
    setCheckIns(response.data.checkIns as CheckIn[])
    setIsLoading(false)
  }
  useEffect(() => {
    void fetchCheckIns()
  }, [challenge.id, currentUser?.id])
  return (
    <div className={`flex flex-col ${isLoading ? 'items-center' : 'items-start'} justify-center mt-4  w-full max-w-lg md:max-w-xl`}>
      {isLoading
        ? <Spinner />
        : <>
        <div className='w-full flex items-center justify-center mb-8'>
          <div className='max-w-[200px] flex-col items-center justify-center'>
            <ChallengeMemberProgressChart challenge={challenge} checkIns={checkIns} />
            <div className='mt-4 flex items-center justify-center'>
              <CheckInButton challenge={challenge} membership={membership} afterCheckIn={fetchCheckIns} />
            </div>
          </div>
        </div>
        <CheckinsList checkIns={checkIns} allowComments={false} posts={[]} newestComment={null}/>
      </>
      }
    </div>
  )
}

export function ChallengeMemberProgressChart ({ challenge, checkIns }: { challenge: Challenge, checkIns: CheckIn[] }): JSX.Element {
  const numDays = challenge.type === 'SELF_LED'
    ? challenge.numDays
    : (challenge?.endAt && challenge.startAt) ? differenceInDays(challenge.endAt, challenge.startAt) : 0
  const typedCheckIns = checkIns as Array<{ createdAt: string }>
  const uniqueDays = new Set(typedCheckIns.map(checkIn => format(new Date(checkIn.createdAt), 'yyyy-MM-dd'))).size
  const progress = numDays ? (uniqueDays / numDays) * 100 : 0
  return (
    <div className='flex flex-col items-center justify-center'>
    <CircularProgressbarWithChildren
      value={progress}
      maxValue={numDays ?? 0}

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
