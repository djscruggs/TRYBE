import { useState, useEffect, useContext } from 'react'
import { type ChallengeSummary, type MemberChallenge, type CheckIn } from '~/utils/types'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { isPast, isFuture } from 'date-fns'
import {
  userLocale,
  pluralize,
  challengeHasStarted,
  textToJSX
} from '~/utils/helpers'
import axios from 'axios'
import { Spinner } from '@material-tailwind/react'
import DatePicker from 'react-datepicker'
import { type DateTimeFormatOptions } from 'intl'
import { LiaUserFriendsSolid } from 'react-icons/lia'
import { useNavigate } from '@remix-run/react'
import LinkRenderer from './linkRenderer'
export default function ChallengeOverview ({ challenge, memberChallenge }: { challenge: ChallengeSummary, memberChallenge?: MemberChallenge }): JSX.Element {
  const isExpired = challenge?.endAt ? isPast(new Date(challenge.endAt)) : false
  const [isStarted, setIsStarted] = useState(challengeHasStarted(challenge, memberChallenge))
  const { currentUser } = useContext(CurrentUserContext)
  const locale = currentUser ? userLocale(currentUser) : 'en-US'
  const dateOptions: DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }
  const [membership, setMembership] = useState<MemberChallenge | null | undefined>(memberChallenge)
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
    setMembership(memberChallenge)
    setIsStarted(challengeHasStarted(challenge, memberChallenge))
  }, [memberChallenge, challenge, membership])
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const fetchCheckIns = async (): Promise<void> => {
    const response = await axios.get(`/api/checkins/${challenge.id}/${currentUser?.id}`)
    setCheckIns(response.data.checkIns as CheckIn[])
  }
  const parsedDescription = textToJSX(challenge.description ?? '')
  const navigate = useNavigate()
  useEffect(() => {
    void fetchCheckIns()
  }, [challenge.id, currentUser?.id])
  return (
    <div className='max-w-lg relative px-2'>
       {!membership &&
          <div className='text-red text-center mb-2'>This is a self-guided challenge. Click program to view the schedule.</div>
        }
      <div className='relative mb-4'>
          {parsedDescription}
          <LinkRenderer text={challenge.description ?? ''} />
      </div>
      {currentUser && challenge.type === 'SCHEDULED' && <button className='cursor-pointer  bg-green-500 hover:bg-red float-right text-white text-xs p-1 px-2 rounded-full' onClick={() => { navigate(`/challenges/v/${challenge.id}/contact`) }}>Contact Host</button>}
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
          {challenge?._count?.members > 1 &&
          <div className='w-1/3'>
            <LiaUserFriendsSolid className="text-grey h-5 w-5 inline mr-1" />
            {challenge?._count.members} {pluralize(challenge?._count.members, 'member')}
          </div>
          }
        </div>

        {membership?.startAt &&
          <div className='flex mt-4'>
            <div className = 'w-1/3'>
              <div className="font-bold">
                  {isFuture(membership.startAt) ? 'Starts' : 'Started'}
              </div>
            {editingStartAt
              ? <EditMemberChallenge which='startAt' memberChallenge={membership} onCancel={() => { setEditingStartAt(false) }} afterSave={(memberChallenge) => { setMembership(memberChallenge); setEditingStartAt(false) }} />
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
                  <EditMemberChallenge which='notificationTime' memberChallenge={membership} onCancel={() => { setEditingNotificationTime(false) }} afterSave={(memberChallenge) => { setMembership(memberChallenge); setEditingNotificationTime(false) }} />
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
            {isExpired && <div className='text-red text-center'>This challenge has ended</div>}
            <div className="mb-2 flex flex-cols">
              <div className="w-1/3">
                <div className="font-bold">
                  {isExpired || isStarted ? 'Started' : 'Starts'}
                </div>
                {challenge.startAt ? new Date(challenge.startAt).toLocaleDateString(locale, dateOptions) : ''}
              </div>
              <div className="w-1/3">
                <div className="font-bold">
                  {isExpired ? 'Ended' : 'Ends'}
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

    </div>
  )
}

interface EditMemberChallengeProps {
  memberChallenge: MemberChallenge | null | undefined
  onCancel: () => void
  afterSave: (memberChallenge: MemberChallenge) => void
  which: 'notificationTime' | 'startAt'
}

export function EditMemberChallenge (props: EditMemberChallengeProps): JSX.Element {
  const { onCancel, afterSave, which } = props
  const [memberChallenge, setMemberChallenge] = useState<MemberChallenge | null | undefined>(props.memberChallenge)
  if (!memberChallenge) {
    return <></>
  }
  let initialNotificationTime: Date | null = null
  if (which === 'notificationTime') {
    initialNotificationTime = new Date()
    initialNotificationTime.setUTCHours(memberChallenge.notificationHour ?? 0)
    initialNotificationTime.setUTCMinutes(memberChallenge.notificationMinute ?? 0)
  } else {
    initialNotificationTime = null
  }
  const { currentUser } = useContext(CurrentUserContext)
  const localTimeFormat = currentUser?.locale === 'en-US' ? 'h:mm a' : 'h:mm'
  const localDateFormat = currentUser?.locale === 'en-US' ? 'M-dd-YYYY' : 'dd-M-YYYY'
  const [formData, setFormData] = useState({
    notificationTime: which === 'notificationTime' ? initialNotificationTime : null,
    startAt: which === 'startAt' ? memberChallenge.startAt ? new Date(memberChallenge.startAt) : null : null
  })
  const selectDate = (date: Date): void => {
    setFormData({ ...formData, startAt: date })
  }
  const selectNotificationTime = (time: Date | null): void => {
    setFormData({ ...formData, notificationTime: time })
  }
  const [errors, setErrors] = useState({
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
    if (!memberChallenge?.id) {
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
    const url = `/api/memberchallenges/${memberChallenge.id}`
    const response = await axios.post(url, data)
    setLoading(false)
    setMemberChallenge(response.data as MemberChallenge)
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
