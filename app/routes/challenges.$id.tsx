import { loadChallengeSummary } from '~/models/challenge.server'
import { loadPostSummary } from '~/models/post.server'
import { loadThreadSummary } from '~/models/thread.server'
import { Outlet, useLoaderData, Link, useNavigate, useLocation, useMatches } from '@remix-run/react'
import React, { useContext, useState } from 'react'
import { useRevalidator } from 'react-router-dom'
import { requireCurrentUser } from '../models/auth.server'
import type { MemberChallenge, Challenge, ChallengeSummary, PostSummary, ThreadSummary } from '~/utils/types'
import { type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import {
  textToJSX,
  userLocale,
  resizeImageToFit,
  pluralize
} from '~/utils/helpers'
import { type DateTimeFormatOptions } from 'intl'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import { Spinner, Button, Menu, MenuHandler, MenuList, MenuItem } from '@material-tailwind/react'
import Logo from '~/components/logo'
import { LiaUserFriendsSolid } from 'react-icons/lia'
import { prisma } from '../models/prisma.server'
import { formatDistanceToNow, format, differenceInDays, differenceInHours } from 'date-fns'
import getUserLocale from 'get-user-locale'
import Liker from '~/components/liker'
import ShareMenu from '~/components/shareMenu'
import DialogDelete from '~/components/dialogDelete'

import { GiHamburgerMenu } from 'react-icons/gi'

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
  const data: ViewChallengeData = useLoaderData()
  const matches = useMatches()
  const { challenge, hasLiked, membership } = data

  const likesCount = challenge?._count?.likes ?? 0
  const location = useLocation()
  const isOverview = matches.length === 3
  const isPosts = location.pathname.includes('posts')

  const { currentUser } = useContext(CurrentUserContext)
  const navigate = useNavigate()
  const [loading, setLoading] = useState<boolean>(false)
  const [isMember, setIsMember] = useState(Boolean(membership?.id))
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
  if (!isOverview && !isPosts) {
    return (
      <div className='flex flex-col'>
        <ChallengeHeader challenge={challenge} size='small' />
        <Outlet />
      </div>
    )
  }

  return (
    <div className='flex flex-col'>
      <div className='max-w-sm md:max-w-md lg:max-w-lg relative'>
        <ChallengeHeader challenge={challenge} size='large' />
        <div className='text-xl py-2 flex items-center justify-center w-full'>
          <div className={`w-fit mr-2 ${isOverview ? 'border-b-2 border-red' : 'cursor-pointer'}`} onClick={() => { navigate(`/challenges/${challenge.id}`) }}>Overview</div>
          <div className={`w-fit  ml-2 ${isPosts ? 'border-b-2 border-red' : 'cursor-pointer'}`} onClick={() => { navigate(`/challenges/${challenge.id}/posts`) }}>Posts</div>
          <div className='absolute right-0'>
            <ChallengeMenu challenge={challenge}/>
          </div>
        </div>
        {isOverview &&
          <ChallengeOverview challenge={challenge} />
        }
      </div>
      {isOverview &&
          <div className="max-w-sm md:max-w-md lg:max-w-lg">
            {challenge?.userId !== currentUser?.id && (
              <>
                <Button
                    onClick={toggleJoin}
                    className=' bg-red hover:bg-green-500 text-white rounded-md p-2 text-xs'>
                      {isMember ? 'Leave Challenge' : 'Join this Challenge'}
                  </Button>
                  {loading && <Spinner className="h-4 w-4 ml-1 inline" />}
              </>
            )}
            {membership && <ChallengeMemberInfo challenge={challenge} memberChallenge={membership}/>}
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

            <div className='mb-16'>
              <Outlet />
            </div>
          </div>
      }
      <Outlet />
</div>
  )
}
function ChallengeHeader ({ challenge, size }: { challenge: Challenge | ChallengeSummary, size: 'small' | 'large' }): JSX.Element {
  const [imgWidth, imgHeight] = resizeImageToFit(Number(challenge.coverPhotoMeta?.width), Number(challenge.coverPhotoMeta?.height), 60)
  return (
    <>
    {size === 'large'
      ? (
          <>
            <div className={`${challenge.coverPhotoMeta?.secure_url ? '' : 'mt-0.5 mb-2'} flex justify-center`}>
            {challenge.coverPhotoMeta?.secure_url && <img src={challenge.coverPhotoMeta?.secure_url} alt={`${challenge?.name} cover photo`} className={`max-w-[${imgWidth}px] max-h-[${imgHeight}px] object-cover`} />}
            </div>
          </>
        )
      : (
      <div className='flex flex-row justify-start items-center w-full'>
        <Link to={`/challenges/${challenge.id}`}>
          {challenge.coverPhotoMeta?.secure_url
            ? <img
              src={challenge.coverPhotoMeta?.secure_url}
              alt={`${challenge?.name} cover photo`}
              width={imgWidth}
              height={imgHeight}
              className={`max-w-[${imgWidth}px] max-h-[${imgHeight}px] rounded-md`}
            />
            : <Logo size='40px' backgroundColor='yellow'/>
          }
          </Link>
        <div className='text-2xl pl-2'>{challenge.name}</div>
      </div>
        )}
    </>
  )
}

function ChallengeMemberInfo ({ challenge, memberChallenge }: { challenge: Challenge, memberChallenge: MemberChallenge | null }): JSX.Element {
  const isMember = Boolean(memberChallenge?.id)
  const [checkingIn, setCheckingIn] = useState<boolean>(false)
  const [membership, setMembership] = useState(memberChallenge)
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
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.statusText ?? 'An error occurred')
      } else {
        toast.error('An unexpected error occurred')
      }
    } finally {
      setCheckingIn(false)
    }
  }
  return (
    <div className="flex text-sm items-center justify-start w-full p-2">
      {isMember && (
        <>

          <div className="text-xs my-2 justify-start w-1/2">
          {membership?.lastCheckIn
            ? (
            <>
            Last check-in: {formatDistanceToNow(membership.lastCheckIn)} ago <br />
            {membership.nextCheckIn && <p>Next check-in {formatNextCheckin()}</p>}
            {Number(membership?._count?.checkIns) > 0 && <p>{memberChallenge?._count?.checkIns} check-ins total</p>}
            </>
              )
            : (
            <p>You haven&apos;t checked in yet</p>
              )}
          </div>
          <div className="text-xs my-2 justify-end w-1/2">
            <Button
              onClick={handleCheckIn}
              disabled={checkingIn || !canCheckInNow()}
              className='bg-red hover:bg-green-500 text-white rounded-md p-2 justify-center text-xs disabled:bg-gray-400'
            >
              {checkingIn ? 'Checking In...' : canCheckInNow() ? 'Check In Now' : 'Checked In'}
            </Button>
        </div>
        </>
      )}
    </div>
  )
}
function ChallengeMenu ({ challenge }: { challenge: Challenge | ChallengeSummary }): JSX.Element {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useContext(CurrentUserContext)
  const isComments = location.pathname.includes('comments')
  const [deleteDialog, setDeleteDialog] = useState(false)
  const revalidator = useRevalidator()
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
      revalidator.revalidate()
      navigate('/challenges')
    } else {
      toast.error('Delete failed')
    }
  }
  return (
    <>
    {!isComments && challenge?.userId === currentUser?.id && (
      <>
        <Menu placement='left'>
          <MenuHandler>
            <Button className='bg-red p-1 md:p-2'>
              <GiHamburgerMenu className='h-6 w-6 md:hidden'/>
              <span className='hidden md:block'>Menu</span>
            </Button>
          </MenuHandler>
          <MenuList>
            <MenuItem onClick={() => { navigate(`/pos ts/new/challenge/${challenge.id}`) }}>
              Post an Update
            </MenuItem>
            <MenuItem onClick={() => { navigate(`/threads/new/challenge/${challenge.id}`) }} >
              Start a Discussion
            </MenuItem>
            posts/new/challenge/$challengeId
            <MenuItem onClick={() => { navigate(`/challenges/${challenge.id}/edit`) }}>Edit</MenuItem>
            <MenuItem onClick={handleDeleteDialog}>
              Delete
            </MenuItem>
          </MenuList>
        </Menu>
      {deleteDialog && <DialogDelete prompt='Are you sure you want to delete this challenge?' isOpen={deleteDialog} deleteCallback={handleDelete} onCancel={cancelDialog}/>}
      </>
    )}
  </>
  )
}
function ChallengeOverview ({ challenge }: { challenge: Challenge | ChallengeSummary }): JSX.Element {
  const parsedDescription = textToJSX(challenge.description ?? '')
  const { currentUser } = useContext(CurrentUserContext)
  const locale = userLocale(currentUser)
  const dateOptions: DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }
  return (
    <div className='md:px-0 justify-start'>
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
        <div className="w-1/2">
          <div className="font-bold">
            Start Date
          </div>
          {new Date(challenge.startAt).toLocaleDateString(locale, dateOptions)}
        </div>
        <div className="w-1/2">
          <div className="font-bold">
            End Date
          </div>
          {new Date(challenge.endAt ?? '').toLocaleDateString(locale, dateOptions)}
        </div>
      </div>
      <div className="mb-2 flex flex-cols">
        <div className="w-1/2">
          <div className="font-bold">
            Frequency
          </div>
          <div className="capitalize">
            {challenge?.frequency?.toLowerCase()}
          </div>
        </div>
        <div className="w-1/2">
          <div className="font-bold">
            Reminders
          </div>
        </div>
      </div>
    </div>
  )
}
