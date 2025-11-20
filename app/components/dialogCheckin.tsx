import { DialogHeader, Dialog, DialogContent, DialogTitle, DialogDescription } from '~/components/ui/dialog'
import type { Challenge, CheckIn } from '~/utils/types'
import { useState, useEffect, JSX } from 'react'
import { CheckInButton } from './checkinButton'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
interface DialogCheckinProps {
  challenge: Challenge
  open?: boolean
  onClose?: () => void
  afterCheckIn?: (checkIn: CheckIn) => void
}

export default function DialogCheckin (props: DialogCheckinProps): JSX.Element {
  const { challenge, open = false, onClose } = props
  const [isOpen, setIsOpen] = useState(open)

  useEffect(() => {
    setIsOpen(open)
  }, [open])

  const handleOpen = (value: boolean): void => {
    setIsOpen(value)
    if (!value && onClose) {
      onClose()
    }
  }

  const handleAfterCheckIn = (checkIn: CheckIn): void => {
    if (props.afterCheckIn) props.afterCheckIn(checkIn)
    setIsOpen(false)
    if (onClose) onClose()
  }

  if (!challenge.id) {
    throw new Error('Challenge object with id is required')
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Check In</DialogTitle>
          <DialogDescription>
            You have not checked in today. Check in now?
          </DialogDescription>
        </DialogHeader>
        <div className='flex justify-center'>
          <CheckInButton challenge={challenge} label='Check In Now' afterCheckIn={handleAfterCheckIn} size='sm' />
        </div>
      </DialogContent>
    </Dialog>
  )
}
