import { DialogHeader, Dialog, DialogDescription } from '~/components/ui/dialog'
import type { Challenge, CheckIn } from '~/utils/types'
import { useState, JSX } from 'react'
import { CheckInButton } from './checkinButton'
interface DialogCheckinProps {
  challenge: Challenge
  open?: boolean
  onClose?: () => void
  afterCheckIn?: (checkIn: CheckIn) => void
}

export default function DialogCheckin (props: DialogCheckinProps): JSX.Element {
  const { challenge, open = false, onClose } = props
  const [isOpen, setIsOpen] = useState(open)
  const handleOpen = (): void => {
    setIsOpen(!isOpen)
    if (onClose) onClose()
  }
  const handleAfterCheckIn = (checkIn: CheckIn): void => {
    if (props.afterCheckIn) props.afterCheckIn(checkIn)
    handleOpen()
  }

  if (!challenge.id) {
    throw new Error('Challenge object with id is required')
  }
  return (
    <Dialog open={isOpen}  size='xs'>
      <Dialog.Trigger as={handleOpen} />
      <DialogHeader>
        You have not checked in today. Check in now?
      </DialogHeader>
      <div className='flex justify-center'>

        <CheckInButton challenge={challenge} label='Check In Now' afterCheckIn={handleAfterCheckIn} size='sm' />
      </div>
    </Dialog>
  )
}
