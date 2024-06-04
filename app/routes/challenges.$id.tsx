import { loadChallengeSummary } from '~/models/challenge.server'
import { loadPostSummary } from '~/models/post.server'
import { loadThreadSummary } from '~/models/thread.server'
import { Outlet, useLoaderData, Link, useNavigate, useLocation } from '@remix-run/react'
import React, { useContext, useState } from 'react'
import { requireCurrentUser } from '../models/auth.server'
import type { MemberChallenge, ChallengeSummary, PostSummary, NoteSummary, ThreadSummary } from '~/utils/types'
import { type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { colorToClassName, convertlineTextToJSX, iconStyle } from '~/utils/helpers'
import { type DateTimeFormatOptions } from 'intl'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import { Spinner, Button } from '@material-tailwind/react'
import { GiShinyApple, GiMeditation } from 'react-icons/gi'
import { FaRegLightbulb } from 'react-icons/fa6'
import { RiMentalHealthLine } from 'react-icons/ri'
import { PiBarbellLight } from 'react-icons/pi'
import { IoFishOutline } from 'react-icons/io5'
import CardPost from '~/components/cardPost'
import CardThread from '~/components/cardThread'
import { LiaUserFriendsSolid } from 'react-icons/lia'
import { prisma } from '../models/prisma.server'
import { formatDistanceToNow, format, differenceInDays, differenceInHours } from 'date-fns'
import getUserLocale from 'get-user-locale'
import Liker from '~/components/liker'
import ShareMenu from '~/components/shareMenu'
import DialogDelete from '~/components/dialogDelete'
import { userLocale, separateTextAndLinks, formatLinks } from '../utils/helpers'

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
  let hasLikedPost = false
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
  let hasLikedThread = false
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
  const data: ViewChallengeData = { challenge: result, membership, hasLiked: Boolean(likes), hasLikedPost, hasLikedThread, checkInsCount, locale, latestPost, latestThread }
  return data
}
export default function ViewChallenge (): JSX.Element {
  const data: ViewChallengeData = useLoaderData()
  const { challenge, hasLiked, hasLikedPost, hasLikedThread, latestPost, latestThread } = data
  const parsedDescription = separateTextAndLinks(challenge.description ?? '')
  const parsedMission = separateTextAndLinks(challenge.mission ?? '')
  console.log(latestThread)
  const [membership, setMembership] = useState(data.membership)

  const likesCount = challenge?._count.likes
  const location = useLocation()

  const showLatest = !location.pathname.includes('members')
  const isComments = location.pathname.includes('comments')
  const { currentUser } = useContext(CurrentUserContext)
  const navigate = useNavigate()
  const [loading, setLoading] = useState<boolean>(false)
  const [checkingIn, setCheckingIn] = useState<boolean>(false)
  const [isMember, setIsMember] = useState(Boolean(membership?.id))
  const [deleteDialog, setDeleteDialog] = useState(false)
  const getFullUrl = (): string => {
    return `${window.location.origin}/challenges/${challenge?.id}`
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

  if (location.pathname.includes('edit') || location.pathname.includes('share')) {
    return <Outlet />
  }
  const locale = userLocale()
  const formatNextCheckin = (): string => {
    if (!membership?.nextCheckIn) {
      return ''
    }
    const daysToNext = differenceInDays(membership.nextCheckIn, new Date())
    const hoursToNext = differenceInHours(membership.nextCheckIn, new Date())
    if (daysToNext >= 4) {
      return 'next ' + format(membership.nextCheckIn, 'cccc')
    }
    if (daysToNext <= 1) {
      if (hoursToNext <= 1) {
        return 'now'
      }
      return `in ${hoursToNext} hours`
    }
    return format(membership.nextCheckIn, 'cccc')
  }
  const canCheckInNow = (): boolean => {
    if (!membership?.nextCheckIn) {
      return true
    }
    const daysToNext = differenceInDays(membership.nextCheckIn, new Date())
    const hoursToNext = differenceInHours(membership.nextCheckIn, new Date())
    if (daysToNext <= 1 && hoursToNext <= 12) {
      return true
    }
    return false
  }
  const handleDeleteDialog = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    setDeleteDialog(true)
  }
  const cancelDialog = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    setDeleteDialog(false)
  }
  const handleDelete = async (event: any): Promise<void> => {
    if (!challenge?.id) {
      throw new Error('cannot delete without an id')
    }
    const url = `/api/challenges/delete/${challenge.id as string | number}`
    const response = await axios.post(url)
    if (response.status === 204) {
      toast.success('Challenge deleted')
      navigate('/challenges')
    } else {
      toast.error('Delete failed')
    }
  }
  const handleCheckIn = async (event: any): Promise<void> => {
    setCheckingIn(true)
    event.preventDefault()
    try {
      const url = `/api/challenges/${challenge?.id as string | number}/checkin`
      const response = await axios.post(url)
      setMembership(response.data.memberChallenge as MemberChallenge)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      toast.success('You are checked in! 🙌')
    } catch (error) {
      console.error(error)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      toast.error(error.response.statusText)
    } finally {
      setCheckingIn(false)
    }
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
  const dateOptions: DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }
  const iconOptions: Record<string, JSX.Element> = {
    GiShinyApple: <GiShinyApple className={iconStyle(challenge?.color ?? 'red')} />,
    GiMeditation: <GiMeditation className={iconStyle(challenge?.color ?? 'red')} />,
    FaRegLightbulb: <FaRegLightbulb className={iconStyle(challenge?.color ?? 'red')} />,
    RiMentalHealthLine: <RiMentalHealthLine className={iconStyle(challenge?.color ?? 'red')} />,
    PiBarbellLight: <PiBarbellLight className={iconStyle(challenge?.color ?? 'red')} />,
    IoFishOutline: <IoFishOutline className={iconStyle(challenge?.color ?? 'red')} />
  }
  const color = colorToClassName(challenge?.color ?? '', 'red')

  return (
    <div className='flex flex-col'>
    <div className={`max-w-sm md:max-w-md lg:max-w-lg border border-transparent border-b-inherit rounded-md ${!challenge.coverPhoto ? `bg-gradient-to-b from-${color} to-90%` : ''}`}>
      <div className={`${challenge.coverPhoto ? '' : 'mt-0.5 mb-2'} flex justify-center max-h-90`}>
          {challenge.coverPhoto && <img src={`${challenge.coverPhoto}?${Date.now()}`} alt={`${challenge?.name} cover photo`} className="rounded-tl-md rounded-tr-md max-w-full h-auto object-cover" />}
      </div>
      <div className={`mb-6 px-4 flex flex-col justify-center bg-gradient-to-b from-${color} to-90%`}>
        <div>
        {challenge.icon && <div className="mb-2 flex justify-center">{iconOptions[challenge.icon]}</div>}
          <h1 className='flex justify-center text-2xl'>{challenge.name}</h1>
          {challenge.userId === currentUser?.id && (
            <div className="flex justify-center mt-2">
              <Link className='underline text-red' to = {`/challenges/${challenge.id as string | number}/edit`}>edit</Link>&nbsp;&nbsp;
              <Link className='underline text-red' onClick={handleDeleteDialog} to = {`/challenges/edit/${challenge.id as string | number}`}>delete</Link>&nbsp;&nbsp;
            </div>
          )}
        </div>
      {deleteDialog && <DialogDelete prompt='Are you sure you want to delete this challenge?' isOpen={deleteDialog} deleteCallback={handleDelete} onCancel={cancelDialog}/>}
      <div className='p-4'>
        <div className="mb-2 text-sm">
          {new Date(challenge.startAt).toLocaleDateString(locale, dateOptions)} to {new Date(challenge.endAt ?? '').toLocaleDateString(locale, dateOptions)}
        </div>
        <div className="mb-2">
          <div className='text-center text-sm font-bold'>About</div>
          <div className='text-left mb-4'>
            {parsedDescription?.text &&
              convertlineTextToJSX(parsedDescription.text ?? '')
            }
            {parsedDescription?.links &&
              formatLinks({ links: parsedDescription.links, keyPrefix: `challenge-${challenge.id}` })
            }
          </div>
        </div>
        {parsedMission && (
        <div className="mb-2">
          <div className='text-center text-sm font-bold'>Mission</div>
          <div className='text-left mb-4'>
            {parsedMission?.text &&
              convertlineTextToJSX(parsedMission.text ?? '')
            }
            {parsedMission?.links &&
              formatLinks({ links: parsedMission.links, keyPrefix: `challenge-${challenge.id}` })
            }
          </div>
        </div>
        )}
        <div className="mb-2 text-sm">
          Checks in <span className="capitalize">{challenge?.frequency?.toLowerCase()}</span>
        </div>

      </div>
      </div>
    </div>
    <div className="max-w-sm md:max-w-md lg:max-w-lg pt-4">
    {!isComments && challenge?.userId === currentUser?.id && (
        <>
        <Button className={`bg-${color} p-2 justify-center`} onClick={() => { navigate(`/posts/new/challenge/${challenge.id}`) }}>
          Post an Update
        </Button>
        <Button className={`bg-${color} p-2 justify-center ml-2`} onClick={() => { navigate(`/threads/new/challenge/${challenge.id}`) }}>
          Start a Thread
        </Button>
      </>
    )}
      {challenge?.userId !== currentUser?.id && (
        <>
          <button
              onClick={toggleJoin}
              className={`mt-8 bg-${color} text-white rounded-md p-2 text-xs`}>
                {isMember ? 'Leave Challenge' : 'Join this Challenge'}
            </button>
            {loading && <Spinner className="h-4 w-4 ml-1 inline" />}
        </>
      )}

      <div className="my-2 flex text-sm items-center justify-start w-full p-2">
      {isMember && (
        <>

          <div className="text-xs my-2 justify-start w-1/2">
          {membership?.lastCheckIn
            ? (
            <>
            Last check-in: {formatDistanceToNow(membership.lastCheckIn)} ago <br />
            {membership.nextCheckIn && <p>Next check-in {formatNextCheckin()}</p>}
            {Number(membership?._count?.checkIns) > 0 && <p>{membership?._count?.checkIns} check-ins total</p>}
            </>
              )
            : (
            <p>You haven&apos;t checked in yet</p>
              )}
          </div>
          <div className="text-xs my-2 justify-end w-1/2">
            <button
              onClick={handleCheckIn}
              disabled={checkingIn || !canCheckInNow()}
              className='bg-red text-white rounded-md p-2 justify-center text-xs disabled:bg-gray-400'
            >
              {checkingIn ? 'Checking In...' : canCheckInNow() ? 'Check In Now' : 'Checked In'}
            </button>
        </div>
        </>
      )}
      </div>
      <div className='w-full'>
        <div className='flex flex-row justify-between w-full'>

          {/* {challenge?._count?.comments > 0 && !isComments && (
            <div className="underline ml-4">

                <Link to={`/challenges/${challenge?.id}/comments#comments`}>
                  <FaRegComment className="h-5 w-5 -mt-1 text-grey mr-1 inline" />
                  {challenge?._count?.comments} comments
                </Link>
            </div>
          )} */}
            {challenge?._count?.members && challenge?._count?.members > 0
              ? (
            <div>
              <Link className="underline" to={`/challenges/${challenge.id}/members`}>
                <LiaUserFriendsSolid className="text-grey h-5 w-5 inline ml-4 -mt-1 mr-1" />
                {challenge?._count.members} members
              </Link>
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
      {latestPost && showLatest &&
      <div className='mt-4'>
        <h2>
          Latest Update
          <span className='float-right'><Link className='underline text-blue' to={`/posts/challenge/${challenge?.id}`}>View All</Link></span>
        </h2>
        <CardPost post={latestPost} fullPost={false} hasLiked={hasLikedPost}/>

      </div>
      }
      {latestThread && showLatest &&
      <div className='mt-4'>
        <h2>
          Latest Discussion
          <span className='float-right'><Link className='underline text-blue' to={`/notes/${latestThread?.id}`}>View All</Link></span>
        </h2>
        <CardThread thread={latestThread} hasLiked={hasLikedThread}/>

      </div>
      }

      {/* {challenge?._count.comments === 0 && !isComments && (
        <div className="w-full">
          No comments yet. <Link to={`/challenges/${challenge.id}/comments`} className="underline">Add comment</Link>
        </div>
      )} */}
      <div className='mb-16'>
        <Outlet />
      </div>
    </div>
</div>
  )
}
