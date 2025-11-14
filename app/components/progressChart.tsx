import { JSX } from 'react'
import { differenceInDays, format } from 'date-fns'
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import type { Challenge, CheckIn } from '~/utils/types'
export function ProgressChart ({ challenge, checkIns }: { challenge: Challenge, checkIns: CheckIn[] }): JSX.Element {
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
