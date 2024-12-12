import { loadChallengeSummary } from '~/models/challenge.server'
import { Outlet, useLoaderData, useNavigate, useLocation, useMatches, type MetaFunction } from '@remix-run/react'
import { useContext, useState } from 'react'
import { requireCurrentUser } from '~/models/auth.server'
import type { MemberChallenge, Challenge, ChallengeSummary, CheckIn } from '~/utils/types'
import { type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { FaChevronCircleLeft } from 'react-icons/fa'
import axios from 'axios'
import {
  textToJSX,
  userLocale,
  pluralize
} from '~/utils/helpers'
import { type DateTimeFormatOptions } from 'intl'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { Spinner } from '@material-tailwind/react'
import { LiaUserFriendsSolid } from 'react-icons/lia'
import { prisma } from '~/models/prisma.server'
import { isPast, differenceInDays } from 'date-fns'
import DialogConfirm from '~/components/dialogConfirm'
import ChallengeHeader from '~/components/challengeHeader'
import { CheckInButton } from '~/components/checkinButton'
interface ViewChallengeData {
  challenge: ChallengeSummary
  membership?: MemberChallenge | null | undefined

}
interface ChallengeSummaryWithCounts extends ChallengeSummary {
  _count: {
    comments: number
    members: number
    likes: number
  }
}

export const loader: LoaderFunction = async (args: LoaderFunctionArgs): Promise<ViewChallengeData | null | { loadingError: string }> => {
  const currentUser = await requireCurrentUser(args)
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
        userId: Number(currentUser.id),
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
  const data = useLoaderData<typeof loader>()
  const matches = useMatches()
  const { challenge, membership } = data
  const parsedDescription = textToJSX(challenge.description as string ?? '')
  const location = useLocation()
  const [showConfirm, setShowConfirm] = useState(false)
  const isOverview = matches.length === 3 // matches[0] is root, matches[1] is the challenges, matches[2] is challenges/v/$idtab
  const isProgram = location.pathname.includes('program')
  const isPosts = location.pathname.includes('posts')
  const isComments = location.pathname.includes('comments')
  const isExpired = isPast(challenge.endAt as Date)
  const { currentUser } = useContext(CurrentUserContext)
  const navigate = useNavigate()
  const [loading, setLoading] = useState<boolean>(false)
  const [isMember, setIsMember] = useState(Boolean(membership?.id))
  const isStarted = challenge.startAt ? isPast(challenge.startAt) : false

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
    } else {
      setIsMember(false)
    }
    setLoading(false)
    setShowConfirm(false)
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
        <ChallengeHeader challenge={challenge} size='small' className='mb-4' />
        {challenge.status === 'DRAFT' && <div className='bg-yellow text-center mb-4 rounded-md'>DRAFT</div>}
        <div className='relative'>
          {parsedDescription}
        </div>
        {challenge.type === 'SCHEDULED' && <button className='cursor-pointer  bg-green-500 hover:bg-red float-right text-white text-xs p-1 px-2 rounded-full' onClick={() => { navigate(`/challenges/v/${challenge.id}/contact`) }}>Contact Host</button>}
        <div className='text-lg py-2 flex items-center justify-center w-full gap-4'>
          <div className={`w-fit ${isOverview ? 'border-b-2 border-red' : 'cursor-pointer'}`} onClick={() => { navigate(`/challenges/v/${challenge.id}`) }}>Overview</div>
          <div className={`w-fit ${isProgram ? 'border-b-2 border-red' : 'cursor-pointer'}`} onClick={() => { navigate(`/challenges/v/${challenge.id}/program`) }}>Program</div>
          {challenge.type === 'SCHEDULED' && <div className={`w-fit ${isPosts ? 'border-b-2 border-red' : 'cursor-pointer'}`} onClick={() => { navigate(`/challenges/v/${challenge.id}/chat`) }}>Chat</div>}
        </div>
        {isOverview &&
          <div className={`${challenge.type === 'SELF_LED' ? 'mt-0' : 'mt-4'}`}>
            <ChallengeOverview challenge={challenge} />
          </div>
        }
      </div>
      {isOverview && challenge.type === 'SCHEDULED' &&
        <div className="max-w-sm md:max-w-md lg:max-w-lg text-center">
          {challenge?.userId !== currentUser?.id && !isExpired && (
            <>
                <button
                  onClick={confirmJoinUnjoin}
                  className='mt-4  bg-red hover:bg-green-500 text-white rounded-full p-1 px-2 cursor-pointer text-xs'>
                    { isMember ? 'Leave Challenge' : 'Join this Challenge' }
                    { loading && <Spinner className='w-4 h-4 inline ml-2' /> }
                </button>

                {showConfirm && (
                  <DialogConfirm
                    isOpen={showConfirm}
                    onConfirm={toggleJoin}
                    onCancel={() => { setShowConfirm(false) }}
                    prompt='Are you sure you want to leave this challenge? All your check-ins will be lost.'
                  />
                )}
            </>
          )}

          <div className='w-full'>
            <div className='flex flex-row justify-between w-full'>
                {challenge?._count?.members && challenge?._count?.members > 0
                  ? (
                <div>
                    <LiaUserFriendsSolid className="text-grey h-5 w-5 inline ml-4 -mt-1 mr-1" />
                    {challenge?._count.members} {pluralize(challenge?._count.members as number, 'member')}
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
      {challenge.type === 'SCHEDULED' && (membership || challenge.userId === currentUser?.id) &&
      <div className='mb-20 max-w-sm md:max-w-md lg:max-w-lg'>
         {!isStarted && <div className='text-center text-grey mt-2'>You can check in and view progress once the challenge starts.</div>}
         <div className='flex justify-between mt-2'>
          <button
              className='w-40 bg-red hover:bg-green-500 text-white font-bold rounded-full p-2 justify-center text-sm disabled:bg-gray-400'
              onClick={() => { navigate(`/challenges/v/${challenge.id}/checkins`) }}
              disabled={!isStarted}
            >
            View Progress
          </button>
          <CheckInButton
            size='lg'
            challenge={challenge}
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

function ChallengeOverview ({ challenge }: { challenge: Challenge | ChallengeSummary }): JSX.Element {
  const isExpired = challenge?.endAt ? isPast(challenge?.endAt) : false
  const isStarted = challenge?.startAt ? isPast(challenge?.startAt) : false
  const { currentUser } = useContext(CurrentUserContext)
  const navigate = useNavigate()
  const locale = userLocale(currentUser)
  const dateOptions: DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }
  return (
    <div className='md:px-0 justify-start'>
      {challenge.type === 'SELF_LED'
        ? (
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
          {differenceInDays(challenge.endAt ?? new Date(), challenge.startAt ?? new Date())} days
        </div>
        <div className='text-red text-center mb-4'>This is a self-guided challenge. Click program to view the schedule.</div>
        </>
          )
        : (
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
          )}

    </div>
  )
}
