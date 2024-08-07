import { useLoaderData, useRouteLoaderData, useNavigate, Link } from '@remix-run/react'
import { requireCurrentUser } from '~/models/auth.server'
import { type Post } from '@prisma/client'
import { type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { prisma } from '~/models/prisma.server'
import { eachDayOfInterval, startOfWeek, format, differenceInDays, isFuture } from 'date-fns'
import { CiCirclePlus } from 'react-icons/ci'
import { type Challenge } from '~/utils/types'
import { userLocale, pluralize } from '~/utils/helpers'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { BsExclamationCircleFill } from 'react-icons/bs'
import { useContext } from 'react'

interface ChallengeScheduleProps {
  challenge: Challenge
  posts: Post[]
  isSchedule?: boolean // if true, this is the scheduling page for the creator, and we should show all posts and empty days
}

export default function ChallengeSchedule ({ challenge, posts, isSchedule = false }: ChallengeScheduleProps): JSX.Element {
  const navigate = useNavigate()
  // Need to capture any dangling posts that are unscheduled in the date range
  const unscheduled: Post[] = []
  const postsByDayNum = posts.reduce<Record<number, Post[]>>((acc, post) => {
    const date = post.publishAt ? new Date(post.publishAt) : new Date(post.createdAt)
    // const day = date.getDate()
    const day = differenceInDays(date, new Date(challenge.startAt)) + 1// Calculate days since challenge.startAt
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

  // Filter posts to get those not in postsByDayNum
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  const { currentUser } = useContext(CurrentUserContext)
  const locale = userLocale(currentUser)
  const startDate = new Date(challenge?.startAt as unknown as Date)
  const endDate = new Date(challenge?.endAt as unknown as Date)
  // const endDate = new Date(2024, 6, 4)
  const days = eachDayOfInterval({ start: startOfWeek(startDate), end: endDate })
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return (
    <div className={`max-w-sm  ${isSchedule ? 'md:max-w-xl lg:max-w-2xl' : 'md:max-w-md lg:max-w-lg'}`}>
      {isSchedule &&
        <div className="w-full mt-4">
          {new Date(challenge.startAt).toLocaleDateString(locale, dateOptions)} to {new Date(challenge.endAt).toLocaleDateString(locale, dateOptions)}
        </div>
      }
      {isSchedule && unscheduled.length > 0 && currentUser?.id === challenge.userId &&
        <div className='border border-red p-2 my-2 rounded-md'>
          <BsExclamationCircleFill className='h-4 w-4  text-red inline-block mr-2 -mt-1' />
          There {pluralize(unscheduled.length, 'is', 'are')} {unscheduled.length} unscheduled {pluralize(unscheduled.length, 'post', 'posts')}.
          {unscheduled.map((post) => {
            return (
              <Link to={`/posts/${post.id}/edit`} key={post.id}>
                <div className='underline cursor-pointer' >{post.title}</div>
              </Link>
            )
          })}
        </div>
      }

      <div className={`${isSchedule ? 'md:grid' : ''}  grid-cols-7 gap-1 w-full mt-4`}>
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
              className={`relative p-2  h-24  ${isInRange ? 'bg-grey' : 'bg-white'}`}
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

              {postsByDayNum[dayNum]?.map((post) => {
                // if post is in the future, don't link to the full post UNLESS it's the user's post
                let linkable = Boolean(((post.publishAt) && (!isFuture(post.publishAt))))
                if (currentUser?.id === post.userId) {
                  linkable = true
                }

                return (
                  <>
                  {((post.publishAt ?? post.published) || currentUser?.id === challenge.userId) &&
                      <div
                        key={post.id}
                        className={`text-xs overflow-hidden border border-red bg-white rounded-md p-1 text-red w-full text-ellipsis mb-1 ${linkable ? 'cursor-pointer' : ''}`}
                        onClick={() => {
                          if (linkable) {
                            navigate(`/posts/${post.id}`)
                          }
                        }}
                      >
                        {!post.published
                          ? <div className='bg-red text-white text-center p-1 rounded-md'>Draft</div>
                          : post.title
                        }
                        {post.title}
                      </div>
                  }
                  </>
                )
              })}
              {isSchedule && isInRange && !postsByDayNum[dayNum] && (currentUser?.id === challenge?.userId) &&
                <div className='flex items-start -mt-3 pt-6 justify-center w-full h-full cursor-pointer'>
                  <CiCirclePlus className='h-8 w-8 text-white bg-red hover:bg-green-600 rounded-full' onClick={() => {
                    navigate(`/posts/new/challenge/${challenge?.id}`, {
                      state: {
                        title: `Day ${dayNum}`,
                        publishAt: format(day, 'yyyy-MM-dd 08:00:00'),
                        notifyMembers: true
                      }
                    })
                  }}/>
                </div>
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
