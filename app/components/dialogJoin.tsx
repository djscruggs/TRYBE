import { useState, useContext, useEffect } from 'react'
import type { Challenge, MemberChallenge } from '~/utils/types'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Spinner
} from '@material-tailwind/react'
import DatePicker from 'react-datepicker'
import axios from 'axios'
interface DeleteDialogProps {
  challenge: Challenge
  isOpen: boolean
  cohortId?: number
  onConfirm: (event: any) => void
  onCancel?: (event: any) => void
  afterJoin?: (isMember: boolean, membership?: MemberChallenge) => void
}

export default function DialogJoin (props: DeleteDialogProps): JSX.Element {
  const { challenge, isOpen, onCancel, afterJoin, cohortId } = props
  const { currentUser } = useContext(CurrentUserContext)
  const localDateFormat = currentUser?.locale === 'en-US' ? 'M-dd-YYYY' : 'dd-M-YYYY'
  const localTimeFormat = currentUser?.locale === 'en-US' ? 'h:mm a' : 'h:mm'
  const [open, setOpen] = useState(isOpen)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    startAt: new Date(new Date().setDate(new Date().getDate() + 1)),
    notificationTime: new Date(new Date().setHours(8, 0, 0, 0))
  })
  const [errors, setErrors] = useState({
    startAt: '',
    notificationTime: ''
  })
  const selectDate = (date: Date): void => {
    setFormData({ ...formData, startAt: date })
  }
  const selectNotificationTime = (time: Date): void => {
    setFormData({ ...formData, notificationTime: time })
  }
  const handleOpen = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    setOpen(!open)
    if (onCancel) onCancel(event)
  }
  useEffect(() => {
    setOpen(isOpen)
  }, [isOpen])
  const validateForm = (): boolean => {
    let valid = true
    const newErrors = { startAt: '', notificationTime: '' }
    if (!cohortId) {
      if (!formData.startAt || formData.startAt < new Date()) {
        newErrors.startAt = 'Start date must be in the future'
        valid = false
      }
    }
    if (!formData.notificationTime) {
      newErrors.notificationTime = 'Notification time is required'
      valid = false
    }
    const notificationHour = formData.notificationTime.getUTCHours()
    const notificationMinute = formData.notificationTime.getUTCMinutes()

    if (notificationHour < 0 || notificationHour > 23 || notificationMinute < 0 || notificationMinute > 59) {
      newErrors.notificationTime = 'Notification time must be between 00:00 and 23:59'
      valid = false
    }

    setErrors(newErrors)
    return valid
  }
  const confirmJoin = async (): Promise<void> => {
    if (!validateForm()) {
      return
    }

    if (!challenge?.id) {
      throw new Error('cannot join without an id')
    }

    setLoading(true)
    const notificationDate = new Date(formData.notificationTime)
    const notificationHour = notificationDate.getUTCHours()
    const notificationMinute = notificationDate.getUTCMinutes()
    const data = new FormData()
    data.append('notificationHour', notificationHour.toString())
    data.append('notificationMinute', notificationMinute.toString())
    data.append('startAt', formData.startAt.toString())
    if (cohortId) {
      data.append('cohortId', cohortId.toString())
    }

    // return // Commented out to allow the function to proceed
    const url = `/api/challenges/join-unjoin/${challenge.id as string | number}`
    const response = await axios.post(url, data)
    if (response.data.result === 'joined') {
      afterJoin?.(true, response.data.data as MemberChallenge)
    } else {
      afterJoin?.(false)
    }
    setLoading(false)
    setOpen(false)
  }
  return (
    <Dialog open={open} handler={handleOpen} size='xs'>
      <DialogHeader>Join Challenge</DialogHeader>
        <DialogBody>
          <div className='flex flex-col items-start'>
            <p>This challenge runs for {challenge.numDays} days. You will be reminded to check in every day according to your notification time.</p>
            {!cohortId &&
              <>
                <label className='my-2'>What day to you want to start?</label>
                <DatePicker
                  name='startAt'
                  required={true}
                  minDate={new Date()}
                  dateFormat={localDateFormat}
                  selected={formData.startAt ? new Date(formData.startAt) : null}
                  onChange={(date: Date) => { selectDate(date) }}
                  className={`p-1 border rounded-md pl-2 ${errors?.startAt ? 'border-red' : 'border-slate-gray-500'}`}
                />
              </>
            }
          <label className='my-2'>What time do you want to be reminded to check in?</label>
          <DatePicker
            name='notificationTime'
            required={true}
            minDate={new Date()}
            dateFormat={localTimeFormat}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            selected={formData.notificationTime ? new Date(formData.notificationTime) : null}
            onChange={(time: Date) => { selectNotificationTime(time) }}
            className={`p-1 border rounded-md pl-2 ${errors?.notificationTime ? 'border-red' : 'border-slate-gray-500'}`}
          />

            </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={onCancel}
            className="mr-1"
          >
            <span>Cancel</span>
          </Button>
          <Button className="bg-red" onClick={confirmJoin}>
            Confirm
            {loading && <Spinner className='w-4 h-4 inline ml-2' />}
          </Button>
        </DialogFooter>
      </Dialog>
  )
}
