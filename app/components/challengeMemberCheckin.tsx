import { formatDistanceToNowStrict, format, differenceInDays, differenceInHours, isPast } from 'date-fns'
import type { Challenge, MemberChallenge, CheckIn } from '~/utils/types'
import { Link, useLocation } from 'react-router';
import { CheckInButton } from '~/components/checkinButton'

import { hasStarted, isExpired } from '~/utils/helpers/challenge'
import { pluralize } from '~/utils/helpers'

interface ChallengeMemberCheckinProps {
  challenge: Challenge
  memberChallenge: MemberChallenge | null
  showDetails?: boolean
  afterCheckIn?: (checkIn: CheckIn) => void
}
export function ChallengeMemberCheckin ({ challenge, memberChallenge, showDetails, afterCheckIn }: ChallengeMemberCheckinProps): JSX.Element {
  const isMember = Boolean(memberChallenge?.id)
  if (!challenge?.id) {
    throw new Error('Challenge object with id is required')
  }
  const membership = memberChallenge
  const expired = isExpired(challenge, membership)
  const started = hasStarted(challenge, membership)
  const location = useLocation()
  const linkToMyCheckins = !location.pathname.includes('checkins')
  const formatNextCheckin = (): string => {
    if (!membership?.nextCheckIn) {
      return ''
    }
    const daysToNext = differenceInDays(membership.nextCheckIn, new Date())
    const hoursToNext = differenceInHours(membership.nextCheckIn, new Date())
    if (daysToNext >= 4) {
      return 'next ' + format(membership.nextCheckIn, 'cccc')
    }
    if (daysToNext <= 1) {
      if (hoursToNext <= 1) {
        return 'now'
      }
      return `${hoursToNext} ${pluralize(hoursToNext, 'hour')}`
    }
    return format(membership.nextCheckIn, 'cccc')
  }
  const canCheckInNow = (): boolean => {
    if (expired || !started || challenge.status === 'DRAFT') {
      return false
    }

    if (!membership?.nextCheckIn) {
      return true
    }
    const daysToNext = differenceInDays(membership.nextCheckIn, new Date())
    const hoursToNext = differenceInHours(membership.nextCheckIn, new Date())
    if (daysToNext <= 1 && hoursToNext <= 12) {
      return true
    }
    return false
  }
  const handleAfterCheckIn = (checkIn: CheckIn): void => {
    if (afterCheckIn) {
      afterCheckIn(checkIn)
    }
  }

  return (
    <div className="flex text-sm items-center justify-center w-full space-x-4 p-2">
      {/* this is gnarly -- we want to only show details if the flag is set */}
      {/* then, only who the link to the checkins page if we currently are NOT on the checkins page */}

      {!expired && (
        <div className="text-xs my-2">
          <CheckInButton challenge={challenge} memberChallenge={memberChallenge} afterCheckIn={handleAfterCheckIn} />
        </div>
      )}
      {isMember && showDetails && (
        <div className="text-xs my-2">
            <>
              {!linkToMyCheckins &&
                <>
                  { membership?.lastCheckIn &&
                    <p>Last: {formatDistanceToNowStrict(membership.lastCheckIn)} ago </p>
                  }
                  {!expired && membership?.nextCheckIn && <p>Next: {formatNextCheckin()}</p>}
                </>
              }

              {linkToMyCheckins &&
                <div className='underline'>
                  <Link to={`/challenges/v/${challenge.id}/checkins`}>
                    View Progress
                  </Link>
                </div>
              }
            </>

        </div>
      )}
    </div>
  )
}
