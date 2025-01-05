import { useState } from 'react'
import type { Challenge, MemberChallenge, CheckIn } from '~/utils/types'
import FormCheckIn from './formCheckin'
import { hasStarted, isExpired } from '~/utils/helpers/challenge'
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
  const cohortId = membership?.cohortId
  const isDraft = challenge.status === 'DRAFT'
  const expired = isExpired(challenge, membership)
  const started = hasStarted(challenge, membership)
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
            className={className ?? `w-fit ${minWidth} bg-red hover:bg-green-500 text-white ${size === 'xs' ? 'text-xs p-1' : 'p-2'} rounded-full justify-center text-sm disabled:bg-gray-400 ${expired ? 'opacity-50 cursor-not-allowed px-2' : ''}`}
            disabled={expired || !started || isDraft || disabled}
          >
            {expired ? 'Challenge Ended' : started ? label : 'Not Started'}
        </button>
      </div>
      {showForm &&
        <DialogCheckIn challengeId={challenge.id} cohortId={cohortId} onCancel={() => { setShowForm(false) }} afterCheckIn={handleAfterCheckIn} isOpen={showForm} />
      }
    </>
  )
}

interface CheckinProps {
  challengeId: number
  isOpen: boolean
  cohortId?: number
  onCancel: () => void
  afterCheckIn: (checkIn: CheckIn) => void
}
function DialogCheckIn ({ challengeId, onCancel, afterCheckIn, isOpen, cohortId }: CheckinProps): JSX.Element {
  const [open, setOpen] = useState<boolean>(isOpen)
  const handleOpen = (): void => {
    setOpen(true)
  }
  return (
    <Dialog open={open} handler={handleOpen} size='xs'>
      <DialogBody>
        <FormCheckIn challengeId={challengeId} cohortId={cohortId} onCancel={onCancel} afterCheckIn={afterCheckIn} />
      </DialogBody>
    </Dialog>
  )
}
