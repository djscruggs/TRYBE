import { formatDistanceToNow, format, differenceInDays, differenceInHours, isPast } from 'date-fns'
import { useState } from 'react'
import { Button } from '@material-tailwind/react'
import type { Challenge, MemberChallenge } from '~/utils/types'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { Link } from '@remix-run/react'

interface ChallengeMemberCheckinProps {
  challenge: Challenge
  memberChallenge: MemberChallenge | null
  afterCheckIn?: () => void
}
export function ChallengeMemberCheckin ({ challenge, memberChallenge, afterCheckIn }: ChallengeMemberCheckinProps): JSX.Element {
  const isMember = Boolean(memberChallenge?.id)
  const [checkingIn, setCheckingIn] = useState<boolean>(false)
  const [membership, setMembership] = useState(memberChallenge)
  const isExpired = isPast(challenge?.endAt)
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
      return `in ${hoursToNext} hours`
    }
    return format(membership.nextCheckIn, 'cccc')
  }
  const canCheckInNow = (): boolean => {
    if (isExpired) {
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

  const handleCheckIn = async (event: any): Promise<void> => {
    setCheckingIn(true)
    event.preventDefault()
    try {
      const url = `/api/challenges/${challenge?.id as string | number}/checkin`
      const response = await axios.post(url)
      setMembership(response.data.memberChallenge as MemberChallenge)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      toast.success('You are checked in! 🙌')
      if (afterCheckIn) {
        afterCheckIn()
      }
    } catch (error) {
      console.error(error)
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.statusText ?? 'An error occurred')
      } else {
        toast.error('An unexpected error occurred')
      }
    } finally {
      setCheckingIn(false)
    }
  }
  return (
    <div className="flex text-sm items-center justify-start w-full p-2">
      {isMember && (
        <>
          <div className="text-xs my-2 justify-start w-1/2">
            {membership?.lastCheckIn
              ? (
              <>
              Last check-in: {formatDistanceToNow(membership.lastCheckIn)} ago <br />
              {!isExpired && membership.nextCheckIn && <p>Next check-in {formatNextCheckin()}</p>}
              {Number(membership?._count?.checkIns) > 0 &&
                <div className='underline'>
                  <Link to={`/challenges/v/${challenge.id}/checkins`}>
                    {memberChallenge?._count?.checkIns} check-ins total
                  </Link>
                </div>
              }
              </>
                )
              : (
              <p>No check-ins yet</p>
                )}
          </div>
          {!isExpired && (
            <div className="text-xs my-2 justify-end w-1/2">
              <Button
                  onClick={handleCheckIn}
                  disabled={checkingIn || !canCheckInNow()}
                  className='bg-red hover:bg-green-500 text-white rounded-md p-2 justify-center text-xs disabled:bg-gray-400'
                >
                  {checkingIn ? 'Checking In...' : canCheckInNow() ? 'Check In Now' : 'Checked In'}
                </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
