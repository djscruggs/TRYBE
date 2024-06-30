import { loadChallengeSummary } from '~/models/challenge.server'
import { loadPostSummary } from '~/models/post.server'
import { loadThreadSummary } from '~/models/thread.server'
import { Outlet, useLoaderData, useNavigate, useLocation, useMatches } from '@remix-run/react'
import { useContext, useState } from 'react'
import { requireCurrentUser } from '~/models/auth.server'
import type { MemberChallenge, Challenge, ChallengeSummary, PostSummary, ThreadSummary } from '~/utils/types'
import { type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import axios from 'axios'
import {
  textToJSX,
  userLocale,
  pluralize
} from '~/utils/helpers'
import { type DateTimeFormatOptions } from 'intl'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { Spinner, Button } from '@material-tailwind/react'
import { LiaUserFriendsSolid } from 'react-icons/lia'
import { prisma } from '~/models/prisma.server'
import { isPast } from 'date-fns'
import getUserLocale from 'get-user-locale'
import Liker from '~/components/liker'
import ShareMenu from '~/components/shareMenu'
import MenuChallenge from '~/components/menuChallenge'
import ChallengeHeader from '~/components/challengeHeader'
import { ChallengeMemberCheckin } from '~/components/challengeMemberCheckin'

interface ViewChallengeData {
  challenge: ChallengeSummary
  latestPost: PostSummary | null
  latestThread: ThreadSummary | null
  hasLiked?: boolean
  hasLikedPost?: boolean
  hasLikedThread?: boolean
  membership?: MemberChallenge | null | undefined
  checkInsCount?: number
  isMember?: boolean
  loadingError?: string | null
  locale?: string
}
interface ChallengeSummaryWithCounts extends ChallengeSummary {
  _count: {
    comments: number
    members: number
    likes: number
  }
}

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  const currentUser = await requireCurrentUser(args)
  const { params } = args
  if (!params.id) {
    return null
  }
  const result: ChallengeSummaryWithCounts | undefined = await loadChallengeSummary(params.id)
  if (!result) {
    const error = { loadingError: 'Challenge not found' }
    return error
  }
  // load memberships, likes & checkins for current user if it exists
  let likes = 0
  let checkInsCount = 0
  let membership
  if (currentUser) {
    const challengeId = params.id ? Number(params.id) : undefined
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
    // has the user liked this challenge?
    likes = await prisma.like.count({
      where: {
        challengeId,
        userId: Number(currentUser.id)
      }
    })
    // how many times has the user checked in for this challenge?
    if (membership) {
      checkInsCount = await prisma.checkIn.count({
        where: {
          challengeId,
          userId: Number(currentUser.id)
        }
      })
    }
  }
  // load most recent post
  let latestPost = null
  let hasLikedPost = 0
  const _post = await prisma.post.findFirst({
    where: {
      challengeId: Number(params.id),
      published: true,
      OR: [
        { publishAt: { lte: new Date() } },
        { publishAt: null }
      ]
    },
    include: {
      user: {
        include: {
          profile: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  if (_post) {
    latestPost = await loadPostSummary(_post.id) as unknown as PostSummary
    hasLikedPost = await prisma.like.count({
      where: {
        postId: Number(_post.id),
        userId: Number(currentUser?.id)
      }
    })
  }
  let latestThread = null
  let hasLikedThread = 0
  const _thread = await prisma.thread.findFirst({
    where: {
      challengeId: Number(params.id)
    },
    include: {
      user: {
        include: {
          profile: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  if (_thread) {
    latestThread = await loadThreadSummary(_thread.id) as unknown as ThreadSummary
    hasLikedThread = await prisma.like.count({
      where: {
        threadId: Number(_thread.id),
        userId: Number(currentUser?.id)
      }
    })
  }
  const locale = getUserLocale()
  const data: ViewChallengeData = { challenge: result, membership, hasLiked: Boolean(likes), hasLikedPost: Boolean(hasLikedPost), hasLikedThread: Boolean(hasLikedThread), checkInsCount, locale, latestPost, latestThread }
  return data
}
export default function ViewChallenge (): JSX.Element {
  const data = useLoaderData<typeof loader>()
  const matches = useMatches()
  const { challenge, hasLiked, membership } = data

  const likesCount = challenge?._count?.likes ?? 0
  const location = useLocation()
  const isOverview = matches.length === 2
  const isProgram = location.pathname.includes('program')
  const isPosts = location.pathname.includes('posts')
  const isComments = location.pathname.includes('comments')
  const isExpired = isPast(challenge.endAt as Date)
  const { currentUser } = useContext(CurrentUserContext)
  const navigate = useNavigate()
  const [loading, setLoading] = useState<boolean>(false)
  const [isMember, setIsMember] = useState(Boolean(membership?.id))
  const getFullUrl = (): string => {
    return `${window.location.origin}/challenges/v/${challenge?.id}`
  }

  if (!data) {
    return <p>No data.</p>
  }
  if (data?.loadingError) {
    return <h1>{data.loadingError}</h1>
  }
  if (!data?.challenge) {
    return <p>Loading...</p>
  }

  const toggleJoin = async (event: any): Promise<void> => {
    event.preventDefault()
    if (!challenge?.id) {
      throw new Error('cannot join without an id')
    }
    setLoading(true)

    const url = `/api/challenges/join-unjoin/${challenge.id as string | number}`
    const response = await axios.post(url)
    setIsMember(response.data.result === 'joined')
    setLoading(false)
  }
  if (!isOverview && !isPosts && !isComments) {
    return (
      <div className='flex flex-col'>
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
        <ChallengeHeader challenge={challenge} size={challenge.coverPhotoMeta?.secure_url ? 'large' : 'small'} />
        <div className='text-lg py-2 flex items-center justify-center w-full'>
          <div className={`w-fit ${isOverview ? 'border-b-2 border-red' : 'cursor-pointer'}`} onClick={() => { navigate(`/challenges/v/${challenge.id}`) }}>Overview</div>
          <div className={`w-fit mx-8 ${isProgram ? 'border-b-2 border-red' : 'cursor-pointer'}`} onClick={() => { navigate(`/challenges/v/${challenge.id}/program`) }}>Program</div>
          <div className={`w-fit ${isPosts ? 'border-b-2 border-red' : 'cursor-pointer'}`} onClick={() => { navigate(`/challenges/v/${challenge.id}/posts`) }}>Posts</div>
          {/* only show menu here if there is a cover photo */}
          {challenge.coverPhotoMeta &&
          <div className='absolute right-0'>
            <MenuChallenge challenge={challenge}/>
          </div>
          }
        </div>
        {isOverview &&
          <ChallengeOverview challenge={challenge} />
        }
      </div>
      {isOverview &&
          <div className="max-w-sm md:max-w-md lg:max-w-lg">
            {challenge?.userId !== currentUser?.id && !isExpired && (
              <>
                <Button
                    onClick={toggleJoin}
                    className=' bg-red hover:bg-green-500 text-white rounded-md p-2 text-xs'>
                      {isMember ? 'Leave Challenge' : 'Join this Challenge'}
                  </Button>
                  {loading && <Spinner className="h-4 w-4 ml-1 inline" />}
              </>
            )}
            {membership && <ChallengeMemberCheckin challenge={challenge} memberChallenge={membership}/>}
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
                  <div className='relative flex justify-end'>
                    <div className='mr-2 inline'><Liker isLiked={Boolean(hasLiked)} itemId={Number(challenge?.id)} itemType='challenge' count={Number(likesCount)}/></div>
                    <ShareMenu copyUrl={getFullUrl()} itemType='challenge' itemId={challenge?.id}/>
                  </div>
              </div>
            </div>

              <Outlet />

          </div>
      }
      <Outlet />
  </div>
  )
}

function ChallengeOverview ({ challenge }: { challenge: Challenge | ChallengeSummary }): JSX.Element {
  const parsedDescription = textToJSX(challenge.description ?? '')
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
      <div className='relative mb-4'>
        <div className="font-bold">
          Name
        </div>
        <div>
          {challenge.name}
        </div>
      </div>
      <div className='relative'>
        <div className="font-bold">
          Description
        </div>
        <div>
          {/* <div className='float-right text-red'>Edit</div> */}
          {parsedDescription}
        </div>
      </div>
      <h1 className='text-xl py-2'>Timing</h1>
      <div className="mb-2 flex flex-cols">
        <div className="w-1/3">
          <div className="font-bold">
            {isExpired || isStarted ? 'Started' : 'Start Date'}
          </div>
          {new Date(challenge.startAt).toLocaleDateString(locale, dateOptions)}
        </div>
        <div className="w-1/3">
          <div className="font-bold">
            {isExpired ? 'Ended' : 'End Date'}
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
