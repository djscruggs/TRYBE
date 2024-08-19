import { loadChallengeSummary } from '~/models/challenge.server'
import { Outlet, useLoaderData, useNavigate, useLocation, useMatches } from '@remix-run/react'
import { useContext, useState } from 'react'
import { requireCurrentUser } from '~/models/auth.server'
import type { MemberChallenge, Challenge, ChallengeSummary } from '~/utils/types'
import { type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import axios from 'axios'
import {
  textToJSX,
  userLocale,
  pluralize
} from '~/utils/helpers'
import { type DateTimeFormatOptions } from 'intl'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { Button } from '@material-tailwind/react'
import { LiaUserFriendsSolid } from 'react-icons/lia'
import { prisma } from '~/models/prisma.server'
import { isPast } from 'date-fns'
import DialogConfirm from '~/components/dialogConfirm'
import ChallengeHeader from '~/components/challengeHeader'
import { CheckInButton } from '~/components/checkinButton'

interface ViewChallengeData {
  challenge: ChallengeSummary
  hasLiked?: boolean
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
  const isContact = location.pathname.includes('contact')
  const isExpired = isPast(challenge.endAt as Date)
  const { currentUser } = useContext(CurrentUserContext)
  const navigate = useNavigate()
  const [loading, setLoading] = useState<boolean>(false)
  const [isMember, setIsMember] = useState(Boolean(membership?.id))

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
        <ChallengeHeader challenge={challenge} size='small' />
        <div className='relative mb-4 text-center text-xl font-bold mt-4'>
          {challenge.name}
        </div>
        <div className='relative'>
          {parsedDescription}
        </div>
        <button className='cursor-pointer bg-grey hover:bg-green-500 float-right text-white text-xs p-1 px-2 rounded-full' onClick={() => { navigate(`/challenges/v/${challenge.id}/contact`) }}>Contact Host</button>
        <div className='text-lg py-2 flex items-center justify-center w-full gap-4'>
          <div className={`w-fit ${isOverview ? 'border-b-2 border-red' : 'cursor-pointer'}`} onClick={() => { navigate(`/challenges/v/${challenge.id}`) }}>Overview</div>
          <div className={`w-fit ${isProgram ? 'border-b-2 border-red' : 'cursor-pointer'}`} onClick={() => { navigate(`/challenges/v/${challenge.id}/program`) }}>Program</div>
          <div className={`w-fit ${isPosts ? 'border-b-2 border-red' : 'cursor-pointer'}`} onClick={() => { navigate(`/challenges/v/${challenge.id}/posts`) }}>Posts</div>

          {/* only show menu here if there is a cover photo */}
        </div>

        {isOverview &&
          <div className='mt-4'>
            <ChallengeOverview challenge={challenge} />
          </div>
        }

      </div>
      {isOverview &&
          <div className="max-w-sm md:max-w-md lg:max-w-lg text-center">
            {challenge?.userId !== currentUser?.id && !isExpired && (
              <>
                <button
                    onClick={confirmJoinUnjoin}
                    loading={loading}
                    className='mt-4 bg-grey hover:bg-green-500 text-white rounded-full p-1 px-2 cursor-pointer text-xs'>
                      {isMember ? 'Leave Challenge' : 'Join this Challenge'}
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
                    <LiaUserFriendsSolid className="text-grey h-5 w-5 inline ml-4 -mt-1 mr-1" />
                      No members yet
                  </div>
                      )}
                  {/* <div className='relative flex justify-end'>
                    <div className='mr-2 inline'><Liker isLiked={Boolean(hasLiked)} itemId={Number(challenge?.id)} itemType='challenge' count={Number(likesCount)}/></div>
                    <ShareMenu copyUrl={getFullUrl()} itemType='challenge' itemId={challenge?.id}/>
                  </div> */}
              </div>
            </div>
            <Outlet />

          </div>
      }

      <Outlet />
      {(membership || challenge.userId === currentUser?.id) &&
      <div className='flex justify-between mt-6 mb-20 max-w-sm md:max-w-md lg:max-w-lg'>
        <button
            className='w-40 bg-red hover:bg-green-500 text-white font-bold rounded-full p-2 justify-center text-sm disabled:bg-gray-400'
            onClick={() => { navigate(`/challenges/v/${challenge.id}/checkins/mine`) }}
          >
          View Progress
        </button>
        <CheckInButton
          size='lg'
          challenge={challenge}
          memberChallenge={membership}
          afterCheckIn={(checkIn: CheckIn) => { navigate(`/challenges/v/${challenge.id}/checkins/mine`) }}
          showDetails={false}/>
      </div>
      }
  </div>
  )
}

function ChallengeOverview ({ challenge }: { challenge: Challenge | ChallengeSummary }): JSX.Element {
  const isExpired = isPast(challenge?.endAt)
  const isStarted = isPast(challenge?.startAt)
  const { currentUser } = useContext(CurrentUserContext)
  const locale = userLocale(currentUser)
  const dateOptions: DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }
  return (
    <div className='md:px-0 justify-start'>
      {isExpired && <div className='text-red text-center'>This challenge has ended</div>}

      <div className="mb-2 flex flex-cols">
        <div className="w-1/3">
          <div className="font-bold">
            {isExpired || isStarted ? 'Started' : 'Starts'}
          </div>
          {new Date(challenge.startAt).toLocaleDateString(locale, dateOptions)}
        </div>
        <div className="w-1/3">
          <div className="font-bold">
            {isExpired ? 'Ended' : 'Ends'}
          </div>
          {new Date(challenge.endAt ?? '').toLocaleDateString(locale, dateOptions)}
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

    </div>
  )
}
