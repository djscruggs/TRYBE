import { useState, useEffect, useContext } from 'react'
import { type ChallengeSummary, type MemberChallenge, type CheckIn } from '~/utils/types'
import { CurrentUserContext } from '~/contexts/CurrentUserContext'
import { useMemberContext } from '~/contexts/MemberContext'
import { isPast, isFuture } from 'date-fns'
import {
  userLocale,
  pluralize,
  textToJSX
} from '~/utils/helpers'
import { hasStarted, getShortUrl } from '~/utils/helpers/challenge'
import axios from 'axios'
import pkg from '@material-tailwind/react';
const { Spinner } = pkg;
import DatePicker from 'react-datepicker'
import { type DateTimeFormatOptions } from 'intl'
import { LiaUserFriendsSolid } from 'react-icons/lia'
import LinkRenderer from './linkRenderer'
import { toast } from 'react-hot-toast'
import { HiOutlineClipboardCopy } from 'react-icons/hi'
interface ChallengeOverviewProps {
  challenge: ChallengeSummary
}
export default function ChallengeOverview (props: ChallengeOverviewProps): JSX.Element {
  const { challenge } = props
  const { membership, setMembership } = useMemberContext()
  const cohortId = membership?.cohortId
  const expired = challenge?.endAt ? isPast(new Date(challenge.endAt)) : false
  const [started, setStarted] = useState(hasStarted(challenge, membership))
  const { currentUser } = useContext(CurrentUserContext)
  const locale = currentUser ? userLocale(currentUser) : 'en-US'
  const dateOptions: DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }
  const formatTime = (hour: number, minute: number): string => {
    // Create a Date object with the given hour and minute in GMT
    const date = new Date(Date.UTC(1970, 0, 1, hour, minute))
    // Convert to local time and format based on locale
    return date.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', hour12: true })
  }
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    if (date instanceof Date && !isNaN(date.getTime())) {
      return date.toLocaleDateString(locale, dateOptions)
    }
    return ''
  }
  const [editingNotificationTime, setEditingNotificationTime] = useState(false)
  const [editingStartAt, setEditingStartAt] = useState(false)

  useEffect(() => {
    setMembership(membership)
    setStarted(hasStarted(challenge, membership))
  }, [membership, challenge])
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const fetchCheckIns = async (): Promise<void> => {
    try {
      const response = await axios.get(`/api/checkins/${challenge.id}/${currentUser?.id}`)
      setCheckIns(response.data.checkIns as CheckIn[])
    } catch (error) {
      console.error('Error fetching check-ins:', error)
    }
  }
  const copyLink = async (): Promise<void> => {
    await navigator.clipboard.writeText(getShortUrl(challenge, membership))
    toast.success('🎉 Link copied to clipboard!')
  }
  const parsedDescription = textToJSX(challenge.description ?? '')
  useEffect(() => {
    void fetchCheckIns()
  }, [challenge.id, currentUser?.id])
  return (
    <div className='max-w-lg relative px-2'>
      <div className='relative mb-4'>
          {parsedDescription}
          <LinkRenderer text={challenge.description ?? ''} />
      </div>

      {challenge.type === 'SELF_LED' &&
      <>
        <div className='flex'>
          <div className="w-1/3">
            <div className="font-bold">
              Frequency
            </div>
            <div className="capitalize">
                {challenge?.frequency?.toLowerCase()}
            </div>
          </div>
          <div className="w-1/3">
            <div className="font-bold">
              Duration
            </div>
            {challenge.numDays} days

          </div>
        </div>

        {membership?.startAt &&
          <div className='flex mt-4'>
            <div className = 'w-1/3'>
              <div className="font-bold">
                  {isFuture(membership.startAt) ? 'Starts' : 'Started'}
              </div>
            {editingStartAt
              ? <EditMembership which='startAt' membership={membership} onCancel={() => { setEditingStartAt(false) }} afterSave={() => { setEditingStartAt(false) }} />
              : <>
              {formatDate(String(membership.startAt))}
              {!editingNotificationTime &&
                <button onClick={() => { setEditingStartAt(true) }} className='ml-2 text-xs text-red underline'>edit</button>
              }
            </>
              }
            </div>
            <div className="w-1/3">
              <div className="font-bold">
                Reminder Time
              </div>
              {editingNotificationTime
                ? (
                <div>
                  <EditMembership which='notificationTime' membership={membership} onCancel={() => { setEditingNotificationTime(false) }} afterSave={() => { setEditingNotificationTime(false) } } />
                </div>
                  )
                : (
                  <>
                  <div className="capitalize inline">{challenge?.frequency.toLowerCase()}</div> at {formatTime(membership?.notificationHour ?? 0, membership?.notificationMinute ?? 0)}
                  {!editingStartAt &&
                    <button onClick={() => { setEditingNotificationTime(true) } } className='ml-2 text-xs text-red underline'>edit</button>
                  }
                  </>
                  )}
            </div>
          </div>
        }
      </>
      }
      {challenge.type === 'SCHEDULED' &&
          <>
            {expired && <div className='text-red text-center'>This challenge has ended</div>}
            <div className="mb-2 flex flex-cols">
              <div className="w-1/3">
                <div className="font-bold">
                  {expired || started ? 'Started' : 'Starts'}
                </div>
                {challenge.startAt ? new Date(challenge.startAt).toLocaleDateString(locale, dateOptions) : ''}
              </div>
              <div className="w-1/3">
                <div className="font-bold">
                  {expired ? 'Ended' : 'Ends'}
                </div>
                {challenge.endAt ? new Date(challenge.endAt).toLocaleDateString(locale, dateOptions) : ''}
              </div>
              <div className="w-1/3">
                <div className="font-bold">
                  Frequency
                </div>
                <div className="capitalize">
                    {challenge?.frequency?.toLowerCase()}
                </div>
              </div>
            </div>
            {challenge?._count?.members > 0 &&
              <div className='w-full'>
                <LiaUserFriendsSolid className="text-grey h-5 w-5 inline mr-1" />
                {challenge?._count.members} {pluralize(challenge?._count.members, 'member')}
              </div>
            }

          </>
        }
        {membership &&
          <div className='flex justify-center items-center mt-4 w-full'>
            <div className='text-xs'>Copy link to invite friends</div>
            <div className='text-lessblack ml-1 text-sm md:text-md  border p-2 rounded-md text-left max-w-[250px]'>{getShortUrl(challenge, membership, cohortId)}</div>
            <HiOutlineClipboardCopy onClick={copyLink} className='h-6 w-6 cursor-pointer ml-1' />
            <div onClick={copyLink} className='ml-1 text-blue underline cursor-pointer text-xs md:text-sm'>copy</div>
          </div>
        }
    </div>
  )
}

interface EditMembershipProps {
  membership: MemberChallenge | null
  onCancel: () => void
  afterSave: (membership: MemberChallenge) => void
  which: 'notificationTime' | 'startAt'
}

export function EditMembership (props: EditMembershipProps): JSX.Element {
  const { onCancel, afterSave, which } = props
  const { membership, setMembership } = useMemberContext()
  if (!membership) {
    return <></>
  }
  let initialNotificationTime: Date | null = null
  if (which === 'notificationTime') {
    initialNotificationTime = new Date()
    initialNotificationTime.setUTCHours(membership.notificationHour ?? 0)
    initialNotificationTime.setUTCMinutes(membership.notificationMinute ?? 0)
  } else {
    initialNotificationTime = null
  }
  const { currentUser } = useContext(CurrentUserContext)
  const localTimeFormat = currentUser?.locale === 'en-US' ? 'h:mm a' : 'h:mm'
  const localDateFormat = currentUser?.locale === 'en-US' ? 'M-dd-YYYY' : 'dd-M-YYYY'
  const [formData, setFormData] = useState({
    notificationTime: which === 'notificationTime' ? initialNotificationTime : null,
    startAt: which === 'startAt' ? membership.startAt ? new Date(membership.startAt) : null : null
  })
  const selectDate = (date: Date): void => {
    setFormData({ ...formData, startAt: date })
  }
  const selectNotificationTime = (time: Date | null): void => {
    setFormData({ ...formData, notificationTime: time })
  }
  const [errors, setErrors] = useState<{
    notificationTime: string | null
    startAt: string | null
  }>({
    notificationTime: null,
    startAt: null
  })
  const [loading, setLoading] = useState(false)
  const validate = (): boolean => {
    let valid = true
    const errors = {
      notificationTime: null as string | null,
      startAt: null as string | null
    }
    if (which === 'notificationTime') {
      if (!formData.notificationTime) {
        errors.notificationTime = 'Notification time is required'
        valid = false
      }
    }
    if (which === 'startAt') {
      if (!formData.startAt) {
        errors.startAt = 'Start date is required'
        valid = false
      }
    }
    setErrors(errors)
    return valid
  }
  const save = async (): Promise<void> => {
    if (!membership?.id) {
      throw new Error('cannot save notification time without an id')
    }
    if (!validate()) {
      return
    }
    const data = new FormData()
    setLoading(true)
    let notificationDate: Date | null = null
    let notificationHour: number | null = null
    let notificationMinute: number | null = null
    if (formData.notificationTime) {
      notificationDate = new Date(formData.notificationTime)
      notificationHour = notificationDate.getUTCHours()
      notificationMinute = notificationDate.getUTCMinutes()
      data.append('notificationHour', notificationHour.toString())
      data.append('notificationMinute', notificationMinute.toString())
    }
    if (formData.startAt) {
      const startAt = new Date(formData.startAt)
      data.append('startAt', startAt.toISOString())
    }
    const url = `/api/memberchallenges/${membership.id}`
    const response = await axios.post(url, data)
    setLoading(false)
    setMembership(response.data.result as MemberChallenge)
    afterSave(response.data.result as MemberChallenge)
  }

  return (
    <div>
      {which === 'notificationTime' &&
        <DatePicker
          selected={formData.notificationTime}
          dateFormat={localTimeFormat}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={15}
          onChange={(date) => { selectNotificationTime(date) }}
          className={`p-1 border rounded-md pl-2 ${errors.notificationTime ? 'border-red' : ''}`}
        />
      }
      {which === 'startAt' &&
        <DatePicker
        name='startAt'
        required={true}
        minDate={new Date()}
        dateFormat={localDateFormat}
        selected={formData.startAt ? new Date(formData.startAt) : null}
        onChange={(date: Date) => { selectDate(date) }}
        className={`p-1 border rounded-md pl-2 ${errors.startAt ? 'border-red' : ''}`}
        />
      }
      <div className='inline'>
        <span onClick={save} className='cursor-pointer text-red text-xs underline mx-2'>Save</span>
        <span onClick={onCancel} className='cursor-pointer text-xs'>Cancel</span>
        {loading && <Spinner className='w-4 h-4 inline ml-2' />}
      </div>
    </div>
  )
}
