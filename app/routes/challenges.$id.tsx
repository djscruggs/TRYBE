import { loadChallengeSummary } from '~/models/challenge.server'
import { Outlet, useLoaderData, Link, useNavigate, useLocation } from '@remix-run/react'
import React, { useContext, useState } from 'react'
import { requireCurrentUser } from '../models/auth.server'
import type { MemberChallenge, ChallengeSummary, Post } from '~/utils/types'
import { json, type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { colorToClassName, convertlineTextToHtml, iconStyle } from '~/utils/helpers'
import { type DateTimeFormatOptions } from 'intl'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import { Spinner, Button } from '@material-tailwind/react'
import { GiShinyApple, GiMeditation } from 'react-icons/gi'
import { FaRegLightbulb } from 'react-icons/fa6'
import { RiMentalHealthLine } from 'react-icons/ri'
import { PiBarbellLight } from 'react-icons/pi'
import { IoFishOutline } from 'react-icons/io5'
import { FaRegComment } from 'react-icons/fa'
import { LiaUserFriendsSolid } from 'react-icons/lia'
import { prisma } from '../models/prisma.server'
import { TbHeartFilled } from 'react-icons/tb'
import { useRevalidator } from 'react-router-dom'
import { formatDistanceToNow, format, differenceInDays, differenceInHours } from 'date-fns'
import CardPost from '~/components/cardPost'
import getUserLocale from 'get-user-locale'
import Liker from '~/components/liker'

interface VideChallengeData {
  challenge?: ChallengeSummary
  hasLiked?: boolean
  membership?: MemberChallenge | null | undefined
  checkInsCount?: number
  isMember?: boolean
  posts?: Post[]
  loadingError?: string | null
  locale?: string
}

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  const currentUser = await requireCurrentUser(args)
  const { params } = args
  if (!params.id) {
    return null
  }
  const result = await loadChallengeSummary(params.id, true)
  if (!result) {
    const error = { loadingError: 'Challenge not found' }
    return json(error)
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
  // load posts
  const posts = await prisma.post.findMany({
    where: {
      AND: {
        challengeId: Number(params.id),
        published: true,
        OR: [
          { publishAt: null },
          { publishAt: { lte: new Date() } }
        ]
      }
    },
    include: {
      _count: {
        select: { comments: true, likes: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  const locale = getUserLocale()
  const data: VideChallengeData = { challenge: result, membership, hasLiked: Boolean(likes), posts, locale }
  return json(data)
}
export default function ViewChallenge (): JSX.Element {
  const data: VideChallengeData = useLoaderData() as VideChallengeData
  const { challenge, posts, hasLiked } = data
  const [membership, setMembership] = useState(data.membership)

  const likesCount = challenge?._count?.likes
  const location = useLocation()
  if (location.pathname.includes('edit') || location.pathname.includes('share')) {
    return <Outlet />
  }
  const isComments = location.pathname.includes('comments')
  const { currentUser } = useContext(CurrentUserContext)
  const navigate = useNavigate()
  const revalidator = useRevalidator()
  const [loading, setLoading] = useState<boolean>(false)
  const [checkingIn, setCheckingIn] = useState<boolean>(false)

  if (!data) {
    return <p>No data.</p>
  }
  if (data?.loadingError) {
    return <h1>{data.loadingError}</h1>
  }
  if (!data?.challenge) {
    return <p>Loading...</p>
  }

  const [isMember, setIsMember] = useState(Boolean(membership?.id))

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

  const handleDelete = async (event: any): Promise<void> => {
    event.preventDefault()
    if (!confirm('Are you sure you want to delete this challenge?')) {
      return
    }
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
    // probably should use revalidate instead but this is quicker to add
    // https://github.com/remix-run/react-router/discussions/10381
    // revalidator.revalidate()
  }
  const dateOptions: DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }
  const iconOptions: Record<string, JSX.Element> = {
    GiShinyApple: <GiShinyApple className={iconStyle(challenge?.color)} />,
    GiMeditation: <GiMeditation className={iconStyle(challenge?.color)} />,
    FaRegLightbulb: <FaRegLightbulb className={iconStyle(challenge?.color)} />,
    RiMentalHealthLine: <RiMentalHealthLine className={iconStyle(challenge?.color)} />,
    PiBarbellLight: <PiBarbellLight className={iconStyle(challenge?.color)} />,
    IoFishOutline: <IoFishOutline className={iconStyle(challenge?.color)} />
  }
  const color = colorToClassName(challenge?.color, 'red')
  return (
    <>
    <div className={`max-w-sm md:max-w-md lg:max-w-lg border border-transparent border-b-inherit rounded-md bg-gradient-to-b from-${color} to-90%`}>
      <div className={'mb-2 mt-0.5 flex justify-center max-h-80 '}>
          {challenge.coverPhoto && <img src={`${challenge.coverPhoto}?${Date.now()}`} alt={`${challenge.name!} cover photo`} className="w-full rounded-sm" />}
      </div>
      <div className="mb-6 px-4 flex flex-col justify-center">
      {challenge.icon && <div className="mb-2 flex justify-center">{iconOptions[challenge.icon]}</div>}
        <h1 className='flex justify-center text-2xl'>{challenge.name!}</h1>
        {challenge.userId === currentUser?.id && (
          <div className="flex justify-center mt-2">
            <Link className='underline text-red' to = {`/challenges/${challenge.id as string | number}/edit`}>edit</Link>&nbsp;&nbsp;
            <Link className='underline text-red' onClick={handleDelete} to = {`/challenges/edit/${challenge.id as string | number}`}>delete</Link>&nbsp;&nbsp;
          </div>
        )}
      </div>
      <div className='p-4'>
        <div className="mb-2 text-sm">
          {new Date(challenge.startAt).toLocaleDateString(undefined, dateOptions)} to {new Date(challenge.endAt).toLocaleDateString(undefined, dateOptions)}
        </div>
        <div className="mb-2">
          <div className='text-center text-sm font-bold'>About</div>
          <div className='text-left mb-4'>
          {convertlineTextToHtml(challenge.description)}
          </div>
        </div>
        {challenge.mission && (
        <div className="mb-2">
          <div className='text-center text-sm font-bold'>Mission</div>
          <div className='text-left mb-4'>
          {convertlineTextToHtml(challenge.mission)}
          </div>
        </div>
        )}
        <div className="mb-2 text-sm">
          Checks in <span className="capitalize">{challenge.frequency.toLowerCase()}</span>
        </div>

      </div>

    </div>

      {challenge.userId !== currentUser?.id && (
        <>
          <button
              onClick={toggleJoin}
              className={`mt-8 bg-${color} text-white rounded-md p-2 text-xs`}>
                {isMember ? 'Leave Challenge' : 'Join this Challenge'}
            </button>
            {loading && <Spinner className="h-4 w-4 ml-1 inline" />}
        </>
      )}

      <div className="my-2 text-sm max-w-sm pl-0">
      {isMember && (
        <>
        {membership?.lastCheckIn && (
          <div className="text-xs my-2">
            Last check-in: {formatDistanceToNow(membership.lastCheckIn)} ago <br />
            {membership.nextCheckIn && <p>Next check-in {formatNextCheckin()}</p>}
            {Number(membership._count.checkIns) > 0 && <p>{membership._count.checkIns} check-ins total</p>}
          </div>
        )}
        <button
          onClick={handleCheckIn}
          disabled={checkingIn || !canCheckInNow()}
          className='bg-red text-white rounded-md p-2 text-xs mb-2 disabled:bg-gray-400'
        >
          {checkingIn ? 'Checking In...' : canCheckInNow() ? 'Check In Now' : 'Checked In'}
        </button>

        </>
      )}

        <div className='flex flex-row justify-left'>
          <div >

          <div className='mr-2'><Liker isLiked={Boolean(hasLiked)} itemId={Number(challenge?.id)} itemType='challenge' count={Number(likesCount)}/></div>
          </div>

          {challenge._count.comments > 0 && !isComments && (
            <div className="underline ml-4">

                <Link to={`/challenges/${challenge.id}/comments#comments`}>
                  <FaRegComment className="h-5 w-5 -mt-1 text-grey mr-1 inline" />
                  {challenge._count.comments} comments
                </Link>
            </div>
          )}
          {challenge._count?.members > 0
            ? (
          <div>

            <Link className="underline" to={`/challenges/${challenge.id}/members`}>
            <LiaUserFriendsSolid className="text-grey h-5 w-5 inline ml-4 -mt-1 mr-1" />
              {challenge._count.members} members
            </Link>
          </div>
              )
            : (
            <div>
              <LiaUserFriendsSolid className="text-grey h-5 w-5 inline ml-4 -mt-1 mr-1" />
                No members yet
            </div>
              )}
        </div>
      </div>
      {!isComments && challenge.userId === currentUser?.id && (
        <Button className={`bg-${color} p-2`} onClick={() => { navigate(`/posts/new/challenge/${challenge.id}`) }}>
          Post an Update
        </Button>
      )}
      {challenge._count.comments == 0 && !isComments && (
        <div className="w-full">
          No comments yet. <Link to={`/challenges/${challenge.id}/comments`} className="underline">Add comment</Link>
        </div>
      )}
      {posts.map((post) => {
        return (
            <div key={`post-${post.id}`} className='max-w-sm md:max-w-md lg:max-w-lg'>
              <CardPost post={post} hideMeta={true}/>
            </div>
        )
      })}
      <div className='mb-16'>
        <Outlet />
      </div>
</>
  )
}
