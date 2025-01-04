import { useState } from 'react'
import type { Challenge, MemberChallenge, CheckIn } from '~/utils/types'
import FormCheckIn from './formCheckin'
import { isPast, addDays } from 'date-fns'
import {
  Dialog,
  DialogBody
} from '@material-tailwind/react'
interface ChallengeMemberCheckinProps {
  challenge: Challenge
  label?: string
  membership?: MemberChallenge
  afterCheckIn?: (checkIn: CheckIn) => void
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
}
export function CheckInButton ({ challenge, membership, afterCheckIn, size, label = 'Check In', className, disabled }: ChallengeMemberCheckinProps): JSX.Element {
  if (!challenge?.id) {
    throw new Error('Challenge object with id is required')
  }
  const isDraft = challenge.status === 'DRAFT'
  let isExpired = false
  if (membership?.startAt && challenge.type === 'SELF_LED') {
    const endDate = addDays(new Date(membership.startAt), challenge.numDays ?? 0)
    isExpired = isPast(endDate)
  } else {
    isExpired = challenge?.endAt ? isPast(challenge?.endAt) : false
  }
  const hasStarted = challenge.type === 'SELF_LED' ? true : challenge.startAt && new Date(challenge.startAt) < new Date()
  const [showForm, setShowForm] = useState<boolean>(false)
  const handleAfterCheckIn = (checkIn: CheckIn): void => {
    setShowForm(false)
    if (afterCheckIn) {
      afterCheckIn(checkIn)
    }
  }
  const minWidth = size === 'xs' ? 'min-w-20' : size === 'sm' ? 'min-w-32' : size === 'md' ? 'min-w-32' : 'min-w-40'

  return (
    <>
      <div>
        <button
            onClick={() => { setShowForm(true) } }
            className={`w-fit ${minWidth} bg-red hover:bg-green-500 text-white ${size === 'xs' ? 'text-xs p-1' : 'p-2'} rounded-full justify-center text-sm disabled:bg-gray-400 ${className} ${isExpired ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isExpired || !hasStarted || isDraft || disabled}
          >
            {isExpired ? 'Challenge Ended' : hasStarted ? label : 'Not Started'}
        </button>
      </div>
      {showForm &&
        <DialogCheckIn challengeId={challenge.id} onCancel={() => { setShowForm(false) }} afterCheckIn={handleAfterCheckIn} isOpen={showForm} />
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
