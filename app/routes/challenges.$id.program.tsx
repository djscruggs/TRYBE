import { useLoaderData, useMatches, useNavigate, useSearchParams } from '@remix-run/react'
import { requireCurrentUser } from '../models/auth.server'
import { type Post } from '@prisma/client'
import { type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { prisma } from '../models/prisma.server'
import { eachDayOfInterval, startOfWeek, format, differenceInDays } from 'date-fns'
import { CiCirclePlus } from 'react-icons/ci'
import { type ObjectData } from '~/utils/types'
import { userLocale } from '~/utils/helpers'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import { useContext } from 'react'
interface ChallengeScheduleData {
  posts: Post[]
}
export const loader: LoaderFunction = async (args: LoaderFunctionArgs): ChallengeScheduleData => {
  await requireCurrentUser(args)
  const { params } = args
  const posts = await prisma.post.findMany({
    where: {
      challengeId: Number(params.id)
    },
    orderBy: [
      { publishAt: 'asc' },
      { createdAt: 'asc' }
    ]
  })
  const data: ChallengeScheduleData = {
    posts: posts.map(post => ({
      ...post,
      createdAt: new Date(post.createdAt),
      publishAt: post.publishAt ? new Date(post.publishAt) : null
    }))
  }
  return data
}
export default function ChallengeSchedule (): JSX.Element {
  const matches = useMatches()
  const { challenge } = matches.find((match) => match.id === 'routes/challenges.$id')?.data as ObjectData
  const { posts } = useLoaderData() as ChallengeScheduleData
  const navigate = useNavigate()
  const postsByDay = posts.reduce<Record<number, Post[]>>((acc, post) => {
    const date = post.publishAt ? new Date(post.publishAt) : new Date(post.createdAt)
    const day = date.getDate()
    if (!acc[day]) {
      acc[day] = []
    }
    acc[day].push(post)
    return acc
  }, {})
  const [searchParams, setSearchParams] = useSearchParams()
  const dateOptions = {
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
    <>
      <div className="w-full mt-4">
        {new Date(challenge.startAt).toLocaleDateString(locale, dateOptions)} to {new Date(challenge.endAt).toLocaleDateString(locale, dateOptions)}
      </div>
      <div className="block md:grid grid-cols-7 gap-1 w-full mt-4">
        {weekDays.map((day) => (
            <div key={day} className="hidden md:block text-center font-bold">
              {day}
            </div>
        ))}

        {days.map((day) => {
          const isInRange = day >= startDate && day <= endDate
          const dayNum = differenceInDays(day, startDate) + 1
          return (
            <div
              key={day.toISOString()}
              className={`relative p-2  h-24  ${isInRange ? 'bg-grey' : 'bg-white'}`}
            >
              <div className="absolute top-0 left-0 m-1 text-xs">
                <span className='md:hidden'>
                  {day.toLocaleDateString(locale, {
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className='hidden md:block'>
                {day.getDate()}
                </span>
              </div>
              <div className="flex flex-col items-start justify-start h-full mt-4 mb-2 overflow-hidden pb-2">

                  {postsByDay[day.getDate()]?.map((post) =>
                    <div key={post.id} className='text-xs overflow-hidden border border-red bg-white rounded-md p-1 text-red w-full text-ellipsis mb-1 cursor-pointer' onClick={() => {
                      navigate(`/posts/${post.id}`)
                    }}>
                    {post.title}
                    </div>
                  )}
                  {isInRange && !postsByDay[day.getDate()] && (currentUser?.id === challenge?.userId) &&
                    <div className='flex items-start -mt-3 pt-6 justify-center w-full h-full cursor-pointer'>
                      <CiCirclePlus className='h-8 w-8 text-white bg-red hover:bg-green-600 rounded-full' onClick={() => {
                        const params = new URLSearchParams()
                        params.set('publishAt', format(day, 'dd-MM-yy'))
                        setSearchParams(params)
                        navigate(`/posts/new/challenge/${challenge?.id}`, {
                          state: {
                            title: `Day ${dayNum}`,
                            publishAt: format(day, 'yyyy-MM-dd 08:00:00')
                          }
                        })
                      }}/>
                    </div>
                  }

              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
