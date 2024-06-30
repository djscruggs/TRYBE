import { formatDistanceToNow, format, differenceInDays, differenceInHours, isPast } from 'date-fns'
import { useState } from 'react'
import type { Challenge, MemberChallenge, CheckIn } from '~/utils/types'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { Link } from '@remix-run/react'
import FormCheckIn from './formCheckin'
import {
  Button,
  Dialog,
  DialogBody
} from '@material-tailwind/react'

interface ChallengeMemberCheckinProps {
  challenge: Challenge
  memberChallenge: MemberChallenge | null
  afterCheckIn?: (checkIn: CheckIn) => void
}
export function ChallengeMemberCheckin ({ challenge, memberChallenge, afterCheckIn }: ChallengeMemberCheckinProps): JSX.Element {
  const isMember = Boolean(memberChallenge?.id)
  if (!challenge?.id) {
    throw new Error('Challenge object with id is required')
  }
  const [showForm, setShowForm] = useState<boolean>(false)
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
  const handleAfterCheckIn = (checkIn: CheckIn): void => {
    setShowForm(false)
    setCheckingIn(false)
    if (afterCheckIn) {
      afterCheckIn(checkIn)
    }
  }
  const handleCheckIn = async (event: any): Promise<void> => {
    setShowForm(true)
    setCheckingIn(true)
    return

    event.preventDefault()
    try {
      const url = `/api/challenges/${challenge?.id as string | number}/checkIn`
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
    <>
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
                  <Link to={`/challenges/v/${challenge.id}/checkins/mine`}>
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
          {!isExpired && !showForm && (
            <div className="text-xs my-2 justify-end w-1/2">
              <Button
                  onClick={handleCheckIn}
                  disabled={!canCheckInNow()}
                  className='bg-red hover:bg-green-500 text-white rounded-md p-2 justify-center text-xs disabled:bg-gray-400'
                >
                  {canCheckInNow() ? 'Check In Now' : 'Checked In'}
                </Button>
            </div>
          )}
        </>
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
