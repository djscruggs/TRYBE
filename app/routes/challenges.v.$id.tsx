import { loadChallengeSummary } from '~/models/challenge.server'
import { Outlet, useLoaderData, useNavigate, useLocation, useMatches, type MetaFunction } from '@remix-run/react'
import { useContext, useEffect, useState } from 'react'
import { getCurrentUser } from '~/models/auth.server'
import type { MemberChallenge, Challenge, ChallengeSummary, CheckIn } from '~/utils/types'
import { type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { FaChevronCircleLeft } from 'react-icons/fa'
import axios from 'axios'
import {
  textToJSX,
  userLocale,
  removeYouTubeLinks,
  removeLinks,
  pluralize,
  challengeHasStarted
} from '~/utils/helpers'
import { type DateTimeFormatOptions } from 'intl'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { Spinner } from '@material-tailwind/react'
import { LiaUserFriendsSolid } from 'react-icons/lia'
import { prisma } from '~/models/prisma.server'
import { isPast, isFuture } from 'date-fns'
import DatePicker from 'react-datepicker'
import DialogConfirm from '~/components/dialogConfirm'
import ChallengeHeader from '~/components/challengeHeader'
import { CheckInButton } from '~/components/checkinButton'
import DialogJoin from '~/components/dialogJoin'
import ChallengeTabs from '~/components/challengeTabs'
import LinkRenderer from '~/components/linkRenderer'
interface ViewChallengeData {
  challenge: ChallengeSummary
  membership?: MemberChallenge | null | undefined
  loadingError?: string
}
interface ChallengeSummaryWithCounts extends ChallengeSummary {
  _count: {
    comments: number
    members: number
    likes: number
  }
}

export const loader: LoaderFunction = async (args: LoaderFunctionArgs): Promise<ViewChallengeData | null | { loadingError: string }> => {
  const currentUser = await getCurrentUser(args)
  const { params } = args
  if (!params.id) {
    return null
  }
  const challenge: ChallengeSummaryWithCounts | undefined = await loadChallengeSummary(params.id)
  if (!challenge) {
    const error = { loadingError: 'Challenge not found' }
    return error
  }
  let membership
  if (currentUser) {
    membership = await prisma.memberChallenge.findFirst({
      where: {
        userId: currentUser ? Number(currentUser.id) : 0,
        challengeId: Number(params.id)
      },
      include: {
        _count: {
          select: { checkIns: true }
        }
      }
    }) as MemberChallenge | null
  }
  return { challenge, membership }
}
export const meta: MetaFunction<typeof loader> = ({
  data
}) => {
  return [{ title: data?.challenge?.name ?? 'Challenge' }]
}
export default function ViewChallenge (): JSX.Element {
  const data = useLoaderData<ViewChallengeData>()
  const matches = useMatches()
  const { challenge } = data
  const [membership, setMembership] = useState<MemberChallenge | null | undefined>(data?.membership as ViewChallengeData['membership'])
  const parsedDescription = textToJSX(challenge.description ?? '')
  const location = useLocation()
  const [showConfirm, setShowConfirm] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const isOverview = matches.length === 3 // matches[0] is root, matches[1] is the challenges, matches[2] is challenges/v/$idtab
  const isProgram = location.pathname.includes('program')
  const isPosts = location.pathname.includes('posts')
  const isComments = location.pathname.includes('comments')
  const isExpired = challenge?.endAt ? isPast(new Date(challenge.endAt)) : false
  const { currentUser } = useContext(CurrentUserContext)
  const navigate = useNavigate()
  const [loading, setLoading] = useState<boolean>(false)
  const [isMember, setIsMember] = useState(Boolean(membership?.id))
  const isStarted = challengeHasStarted(challenge as Challenge, membership)

  if (!data) {
    return <p>No data.</p>
  }
  if (data?.loadingError) {
    return <h1>{data.loadingError}</h1>
  }
  if (!data?.challenge) {
    return <p>Loading...</p>
  }

  const confirmJoinUnjoin = async (): Promise<void> => {
    if (!currentUser) {
      const redirectTo = location.pathname
      localStorage.setItem('redirectTo', redirectTo)
      navigate(`/signup?redirectTo=${redirectTo}`)
      return
    }
    if (challenge.type === 'SELF_LED' && !isMember) {
      setShowJoin(true)
      return
    }
    if (isMember) {
      setShowConfirm(true)
    } else {
      await toggleJoin()
    }
  }
  const toggleJoin = async (): Promise<void> => {
    if (!challenge?.id) {
      throw new Error('cannot join without an id')
    }
    setLoading(true)

    const url = `/api/challenges/join-unjoin/${challenge.id as string | number}`
    const response = await axios.post(url)
    if (response.data.result === 'joined') {
      setIsMember(true)
      setMembership(response.data.result as MemberChallenge)
    } else {
      setIsMember(false)
    }
    setLoading(false)
    setShowConfirm(false)
  }
  const afterJoin = (isMember: boolean, membership?: MemberChallenge): void => {
    setIsMember(isMember)
    setMembership(membership)
    setShowJoin(false)
  }
  if (!isOverview && !isPosts && !isComments && !isProgram) {
    return (
      <div className='flex flex-col mt-2 md:mt-0'>
        <ChallengeHeader challenge={challenge} size='small' />
        <div className='mb-16'>
          <Outlet />
        </div>
      </div>
    )
  }
  return (
    <div className='flex flex-col'>
      <div className='max-w-sm md:max-w-md lg:max-w-lg relative'>
        <ChallengeHeader challenge={challenge as Challenge} size='small' />
        <ChallengeTabs challenge={challenge as Challenge} isOverview={isOverview} isProgram={isProgram} isPosts={isPosts} isMember={isMember}/>
        <div className='relative'>
          {parsedDescription}
          <LinkRenderer text={challenge.description ?? ''} />
        </div>
        {currentUser && challenge.type === 'SCHEDULED' && <button className='cursor-pointer  bg-green-500 hover:bg-red float-right text-white text-xs p-1 px-2 rounded-full' onClick={() => { navigate(`/challenges/v/${challenge.id}/contact`) }}>Contact Host</button>}

        {isOverview &&
          <div className={`${challenge.type === 'SELF_LED' ? 'mt-0' : 'mt-4'}`}>
            <ChallengeOverview challenge={challenge as Challenge} memberChallenge={membership} />
          </div>
        }
      </div>
      {isOverview &&
        <div className="max-w-sm md:max-w-md lg:max-w-lg text-center">
          {!isExpired && (

            <>
                <button
                  onClick={confirmJoinUnjoin}
                  className='mt-4  bg-red hover:bg-green-500 text-white rounded-full p-1 px-2 cursor-pointer text-xs'>
                    { isMember ? 'Leave Challenge' : 'Join this Challenge' }
                    { loading && <Spinner className='w-4 h-4 inline ml-2' /> }
                </button>
                <DialogConfirm
                  isOpen={showConfirm}
                  onConfirm={toggleJoin}
                  onCancel={() => { setShowConfirm(false) }}
                  prompt='Are you sure you want to leave this challenge? All your check-ins will be lost.'
                />

                <DialogJoin
                  isOpen={showJoin}
                  challenge={challenge as Challenge}
                  onConfirm={toggleJoin}
                  onCancel={() => { setShowJoin(false) }}
                  afterJoin={afterJoin}
                />

            </>
          )}

          <div className='w-full'>
            <div className='flex flex-row justify-between w-full'>
                {challenge?._count?.members && challenge?._count?.members > 0
                  ? (
                <div>
                    <LiaUserFriendsSolid className="text-grey h-5 w-5 inline ml-4 -mt-1 mr-1" />
                    {challenge?._count.members} {pluralize(challenge?._count.members, 'member')}
                </div>
                    )
                  : (
                <div>
                  <LiaUserFriendsSolid className="text-grey h-5 w-5 inline -mt-1 mr-1" />
                    No members yet
                </div>
                    )}
            </div>
          </div>
          <Outlet />

        </div>
      }

      <Outlet />
      {(membership ?? challenge.userId === currentUser?.id) &&
      <div className='mb-20 max-w-sm md:max-w-md lg:max-w-lg'>
         {!isStarted && <div className='text-center text-grey mt-2'>You can check in and view progress once the challenge starts.</div>}
         <div className='flex justify-between mt-2'>
          <button
              className='w-40 bg-red hover:bg-green-500 text-white rounded-full p-2 justify-center text-sm disabled:bg-gray-400'
              onClick={() => { navigate(`/challenges/v/${challenge.id}/checkins`) }}
              disabled={!isStarted}
            >
            View Progress
          </button>
          <CheckInButton
            size='lg'
            challenge={challenge as Challenge}
            afterCheckIn={(checkIn: CheckIn) => { navigate(`/challenges/v/${challenge.id}/checkins`) }}
            disabled={!isStarted}
          />
         </div>
         <div className='flex items-center md:hidden justify-center w-full my-1'>
          <FaChevronCircleLeft
            className='w-6 h-6 text-grey cursor-pointer'
            onClick={() => { navigate('/challenges/') }}
          />
        </div>
      </div>
      }

  </div>
  )
}

function ChallengeOverview ({ challenge, memberChallenge }: { challenge: Challenge | ChallengeSummary, memberChallenge?: MemberChallenge | null | undefined, isMember?: boolean }): JSX.Element {
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
  return (
    <div className='md:px-0 justify-start'>
      {challenge.type === 'SELF_LED' &&

        <>
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
            {membership?.startAt &&
              <>
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
              </>
            }
            {membership?.startAt &&
            <>
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
            </>
          }
          </div>
          {!membership &&
            <div className='text-red text-center mb-4'>This is a self-guided challenge. Click program to view the schedule.</div>
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
