import { formatDistanceToNowStrict, format, differenceInDays, differenceInHours, isPast } from 'date-fns'
import { useState } from 'react'
import type { Challenge, MemberChallenge, CheckIn } from '~/utils/types'
import { Link, useLocation } from '@remix-run/react'
import FormCheckIn from './formCheckin'
import {
  Button,
  Dialog,
  DialogBody
} from '@material-tailwind/react'
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
  const [checkinCount, setCheckinCount] = useState<number>(memberChallenge?._count?.checkIns ?? 0)
  const [showForm, setShowForm] = useState<boolean>(false)
  const [membership, setMembership] = useState(memberChallenge)
  const challengeIsExpired = challenge?.endAt ? isPast(challenge?.endAt) : false
  const location = useLocation()
  const linkToCheckins = !location.pathname.includes('checkins/mine')
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
    if (challengeIsExpired) {
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
    setShowForm(false)
    setCheckinCount(checkinCount + 1)
    if (afterCheckIn) {
      afterCheckIn(checkIn)
    }
  }

  return (
    <>
    <div className="flex text-sm items-center w-full md:w-1/2 p-2">
      {/* this is gnarly -- we want to only show details if the flag is set */}
      {/* then, only who the link to the checkins page if we currently are NOT on the checkins page */}
      {isMember && showDetails && (
        <>
          <div className="text-xs my-2 justify-start w-1/2">
            {membership?.lastCheckIn &&
              <>
                Last: {formatDistanceToNowStrict(membership.lastCheckIn)} ago <br />
                {!challengeIsExpired && membership.nextCheckIn && <p>Next: {formatNextCheckin()}</p>}
                {linkToCheckins &&
                  <>
                    {Number(membership?._count?.checkIns) > 0 &&
                      <div className='underline'>
                        <Link to={`/challenges/v/${challenge.id}/checkins/mine`}>
                          {checkinCount + ' ' + pluralize(checkinCount, 'check-in')}
                        </Link>
                      </div>
                    }
                    {Number(membership?._count?.checkIns) === 0 &&
                      <p>No check-ins yet</p>
                    }
                  </>
                }
              </>
              }
          </div>

        </>
      )}
      {!challengeIsExpired && !showForm && (
            <div className="text-xs my-2 text-end md:text-start md:w-1/2">
              <Button
                  onClick={() => { setShowForm(true) } }
                  disabled={!canCheckInNow()}
                  className='bg-red hover:bg-green-500 text-white rounded-full p-2 justify-center text-xs disabled:bg-gray-400'
                >
                  {canCheckInNow() ? 'Check In Now' : 'Checked In'}
              </Button>
            </div>
      )}
    </div>
    {showForm &&
      <div className='w-full max-w-sm'>
        <FormCheckIn challengeId={challenge.id} onCancel={() => { setShowForm(false) }} afterCheckIn={handleAfterCheckIn} />
      </div>
    }
    </>
  )
}

interface CheckinProps {
  challengeId: number
  isOpen: boolean
  onCancel: () => void
  afterCheckIn: (checkIn: CheckIn) => void
}
function DialogCheckIn ({ challengeId, onCancel, afterCheckIn, isOpen }: CheckinProps): JSX.Element {
  const [open, setOpen] = useState<boolean>(isOpen)
  const handleOpen = (): void => {
    setOpen(true)
  }
  return (
    <Dialog open={open} handler={handleOpen} size='xs'>
        <DialogBody>
          <FormCheckIn challengeId={challengeId} onCancel={onCancel} afterCheckIn={afterCheckIn} />
        </DialogBody>
      </Dialog>
  )
}

export function CheckInButton ({ challengeId, onCancel, afterCheckIn }: CheckInButtonProps): JSX.Element {
  return (
    <Button
      onClick={() => { setShowForm(true) } }
      className='bg-red hover:bg-green-500 text-white rounded-full p-2 justify-center text-xs disabled:bg-gray-400'
    >
      Check In
    </Button>
  )
}
