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
  size?: 'sm' | 'md' | 'lg'
}
export function CheckInButton ({ challenge, memberChallenge, showDetails, afterCheckIn, size }: ChallengeMemberCheckinProps): JSX.Element {
  if (!challenge?.id) {
    throw new Error('Challenge object with id is required')
  }
  const [showForm, setShowForm] = useState<boolean>(false)
  const handleAfterCheckIn = (checkIn: CheckIn): void => {
    setShowForm(false)
    if (afterCheckIn) {
      afterCheckIn(checkIn)
    }
  }

  return (
    <>
      <div>
        <button
            onClick={() => { setShowForm(true) } }
            className='w-40 bg-red hover:bg-green-500 text-white font-bold rounded-full p-2 justify-center text-sm disabled:bg-gray-400'
          >
            Check In
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
