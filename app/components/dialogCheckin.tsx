import {
  DialogHeader,
  Dialog,
  DialogBody
} from '@material-tailwind/react'
import type { Challenge, CheckIn } from '~/utils/types'
import FormCheckIn from './formCheckin'
import { useState } from 'react'
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
    <Dialog open={isOpen} handler={handleOpen} size='xs'>
      <DialogHeader>
        You have not checked in today. Check in now?
      </DialogHeader>
      <DialogBody className='flex justify-center'>

        <CheckInButton challenge={challenge} label='Check In Now' afterCheckIn={handleAfterCheckIn} size='sm' />
      </DialogBody>
    </Dialog>
  )
}
