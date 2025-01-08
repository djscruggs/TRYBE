import { useNavigate, Link } from '@remix-run/react'
import {
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  format,
  differenceInDays,
  isFuture
  , addDays
} from 'date-fns'
import { HiMiniPlusSmall } from 'react-icons/hi2'
import type { Challenge, MemberChallenge, Post } from '~/utils/types'
import { userLocale, pluralize } from '~/utils/helpers'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { BsExclamationCircleFill } from 'react-icons/bs'
import { useContext } from 'react'
import { hasStarted } from '~/utils/helpers/challenge'

interface ChallengeScheduleProps {
  challenge: Challenge
  posts: Post[]
  isSchedule?: boolean // if true, this is the scheduling page for the creator, and we should show all posts and empty days
  membership: MemberChallenge | null
}

export default function ChallengeSchedule ({ challenge, posts, isSchedule = false, membership }: ChallengeScheduleProps): JSX.Element {
  // Need to capture any dangling posts that are unscheduled in the date range
  const unscheduled: Post[] = []

  // create arrays of posts by day number and those that are unscheduled
  const { currentUser } = useContext(CurrentUserContext)
  const userIsCreator = currentUser?.id === challenge.userId
  if (challenge.type === 'SELF_LED') {
    posts.forEach((post) => {
      if (!post.publishOnDayNumber) {
        unscheduled.push(post)
      }
    })
  }
  return (
    <div className={`flex-col  border-red items-center w-screen max-w-2xl  ${isSchedule ? 'md:max-w-xl lg:max-w-2xl' : 'md:max-w-md lg:max-w-lg'}`}>
       {(userIsCreator || currentUser?.role === 'ADMIN') &&
          <UnscheduledPosts posts={unscheduled} />
      }
      {isSchedule &&
        <ScheduleDateRange challenge={challenge} />
      }
      {challenge.type === 'SCHEDULED' &&
        <DateSchedule challenge={challenge} posts={posts} isSchedule={isSchedule} membership={membership} />
      }
      {challenge.type === 'SELF_LED' &&
        <NumberSchedule challenge={challenge} posts={posts} isSchedule={isSchedule} membership={membership} />
      }
    </div>
  )
}

const DateSchedule = ({ challenge, posts, isSchedule, membership }: { challenge: Challenge, posts: Post[], isSchedule: boolean, membership: MemberChallenge | null }): JSX.Element => {
  // Need to capture any dangling posts that are unscheduled in the date range
  const unscheduled: Post[] = []
  // create arrays of posts by day number and those that are unscheduled
  const postsByDayNum = posts.reduce<Record<number, Post[]>>((acc, post) => {
    const date = post.publishAt ? new Date(post.publishAt) : new Date(post.createdAt)
    const day = differenceInDays(date, new Date(challenge.startAt as unknown as Date)) + 1// Calculate days since challenge.startAt
    if (day <= 0) {
      unscheduled.push(post)
    } else {
      if (!acc[day]) {
        acc[day] = []
      }
      acc[day].push(post)
    }
    return acc
  }, {})
  const { currentUser } = useContext(CurrentUserContext)
  const locale = userLocale(currentUser)
  const startDate = new Date(challenge?.startAt as unknown as Date)
  startDate.setHours(0, 0, 0, 0) // set it to midnight
  const endDate = new Date(challenge?.endAt as unknown as Date)
  const days = eachDayOfInterval({ start: startOfWeek(startDate), end: endOfWeek(endDate) })
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const userIsCreator = currentUser?.id === challenge.userId
  return (
    <div className={`px-2 w-full max-w-lg  ${isSchedule ? 'md:max-w-xl lg:max-w-2xl' : 'md:max-w-md lg:max-w-lg'}`}>
      <div className={`${isSchedule ? 'md:grid' : ''}  grid-cols-7 gap-0 w-full mt-4 `}>
        {/* only show the days if we're on the schedule page */}
        {weekDays.map((day) => (
            <div key={day} className={`hidden ${isSchedule ? 'md:block' : ''} text-center font-bol`}>
              {day}
            </div>
        ))}

        {days.map((day) => {
          const isInRange = day >= startDate && day <= endDate
          const dayNum = differenceInDays(day, startDate) + 1
          return (
            <>
            {(postsByDayNum[dayNum] || isSchedule) &&
            <div
              key={day.toISOString()}
              className={`relative p-2  h-24   ${isInRange ? 'bg-lightgrey border border-[#CECECE]' : 'bg-white'}`}
            >
              <div className="absolute top-0 left-0 m-1 text-xs ">
                <span className={`${isSchedule ? 'md:hidden' : ''}`}>
                  {day.toLocaleDateString(locale, {
                    weekday: 'short',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className={`hidden ${isSchedule ? 'md:block' : ''}`}>
                  {day.getDate()}
                </span>
              </div>
              <div className="flex flex-col items-start justify-start h-full mt-4 mb-2 overflow-hidden pb-2">
                {postsByDayNum[dayNum]?.map((post) => (
                  <PostsBlock post={post} isSchedule={isSchedule} challenge={challenge} key={post.id} membership={membership} />
                ))}
                {isSchedule && isInRange && !postsByDayNum[dayNum] && userIsCreator &&
                  <NewPostLink day={dayNum} challenge={challenge} />
                }

              </div>
            </div>
            }
            </>
          )
        })}
      </div>
    </div>
  )
}

const NumberSchedule = ({ challenge, posts, isSchedule, membership }: { challenge: Challenge, posts: Post[], isSchedule: boolean, membership: MemberChallenge | null }): JSX.Element => {
  const postsByDayNum = posts.reduce<Record<number, Post[]>>((acc, post) => {
    const publishOnDayNumber = post.publishOnDayNumber // Assuming this property exists
    if (Number(publishOnDayNumber) > 0) {
      if (!acc[Number(publishOnDayNumber)]) {
        acc[Number(publishOnDayNumber)] = []
      }
      acc[Number(publishOnDayNumber)].push(post)
    }
    return acc
  }, {})
  const { currentUser } = useContext(CurrentUserContext)
  const userIsCreator = currentUser?.id === challenge.userId
  const numDays = challenge.numDays ?? 0 // Default to 0 if numDays is null or undefined
  return (
    <div className={`w-full max-w-screen px-4 md:px-0  ${isSchedule ? 'md:max-w-xl lg:max-w-2xl' : 'md:max-w-md lg:max-w-lg'}`}>
      <div className={`${isSchedule ? 'md:grid' : ''}  grid-cols-7 gap-2 w-full mt-4`}>
        {Array.from({ length: numDays }, (_, index) => (
          <div key={index} className="flex flex-col items-center justify-center p-2 border border-gray-300 text-center  relative  h-24 bg-lightgrey  border-[#CECECE]'">
            {!postsByDayNum[index + 1] && <>Day {index + 1}</>}
            {postsByDayNum[index + 1]?.map((post) => (
              <div className='flex items-center justify-center h-full' key={post.id}>
                <PostsBlock post={post} isSchedule={isSchedule} challenge={challenge} key={post.id} membership={membership} />
              </div>
            ))}
            {isSchedule && !postsByDayNum[index + 1] && userIsCreator &&
              <NewPostLink day={index + 1} challenge={challenge} />
            }
          </div>
        ))}
      </div>
    </div>
  )
}

const PostsBlock = ({ post, challenge, isSchedule, membership }: { post: Post, challenge: Challenge, isSchedule: boolean, membership: MemberChallenge | null }): JSX.Element => {
  const { currentUser } = useContext(CurrentUserContext)
  const navigate = useNavigate()
  // if post is in the future, don't link to the full post UNLESS it's the user's post
  let linkable = false
  const started = hasStarted(challenge, membership)
  if (challenge.type === 'SCHEDULED') {
    linkable = Boolean(((post.publishAt) && (!isFuture(post.publishAt))))
  }
  if (challenge.type === 'SELF_LED') {
    if (started && post.publishOnDayNumber && membership && post.publishOnDayNumber <= membership.dayNumber) {
      linkable = true
    }
  }
  if (currentUser?.id === post.userId) {
    linkable = true
  }
  const goToPost = (): void => {
    navigate(`/posts/${post.id}`)
  }

  const isPublished = (): boolean => {
    if (challenge.type === 'SELF_LED') {
      if (post.publishOnDayNumber) {
        return true
      }
      return false
    }
    return Boolean(post.published || post.publishAt)
  }
  return (
    <>
      {(isPublished() || currentUser?.id === challenge.userId) &&
          <>
          <div
            key={post.id}
            className={`${isSchedule ? 'text-xs' : 'text-xl h-full flex items-center'} overflow-hidden text-black w-full text-ellipsis mb-1 ${linkable ? 'underline cursor-pointer' : ''}`}
            onClick={linkable ? goToPost : undefined}
          >
            {post.title}

          </div>
          <DraftBadge published={isPublished()} />
        </>
      }
    </>
  )
}
function DraftBadge ({ published }: { published: boolean }): JSX.Element {
  if (!published) {
    return <div className='ml-2 text-sm text-yellow'>Draft</div>
  }
  return <></>
}

const NewPostLink = ({ day, challenge }: { day: number, challenge: Challenge }): JSX.Element => {
  const navigate = useNavigate()
  const newPost = (): void => {
    const startDate = challenge.type === 'SCHEDULED' ? new Date(challenge.startAt as unknown as Date) : null
    const state = {
      title: `Day ${day}`,
      publishAt: startDate ? format(addDays(startDate, day - 1), 'yyyy-MM-dd 08:00:00') : null,
      dayNumber: day,
      notifyMembers: true
    }
    navigate(`/posts/new/challenge/${challenge?.id}`, { state })
  }

  return (
    <div className='flex items-start -mt-3 pt-6 justify-center w-full h-full cursor-pointer'>
      <HiMiniPlusSmall
        className='h-8 w-8  text-red bg-white hover:text-white hover:bg-red rounded-full'
        onClick={newPost}
      />
    </div>
  )
}

const UnscheduledPosts = ({ posts }: { posts: Post[] }): JSX.Element => {
  if (posts.length === 0) {
    return <></>
  }
  return (
    <div className='p-2 my-2 rounded-md'>
      <BsExclamationCircleFill className='h-4 w-4  text-red inline-block mr-2 -mt-1' />
      There {pluralize(posts.length, 'is', 'are')} {posts.length} unscheduled {pluralize(posts.length, 'post', 'posts')}.
      {posts.map((post) => {
        return (
          <Link to={`/posts/${post.id}/edit`} key={post.id}>
            <div className='underline cursor-pointer' >{post.title}</div>
          </Link>
        )
      })}
    </div>
  )
}

const ScheduleDateRange = ({ challenge }: { challenge: Challenge }): JSX.Element => {
  if (challenge.type === 'SELF_LED') {
    return <></>
  }
  const { currentUser } = useContext(CurrentUserContext)
  const locale = userLocale(currentUser)
  // function to format the date for the challenge start and end dates
  const formattedDate = (date: Date): string => {
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  const startDate = new Date(challenge?.startAt as unknown as Date)
  const endDate = new Date(challenge?.endAt as unknown as Date)
  return (
    <div className="w-full mt-4">
      {formattedDate(startDate)} to {formattedDate(endDate)}
    </div>
  )
}
