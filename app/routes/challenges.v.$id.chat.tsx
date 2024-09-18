import { useLoaderData } from '@remix-run/react'
import { useEffect, useRef } from 'react'
import { requireCurrentUser } from '~/models/auth.server'
import type { Post, CheckIn } from '~/utils/types'
import { type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { prisma } from '~/models/prisma.server'
import CardPost from '~/components/cardPost'
import CheckinsList from '~/components/checkinsList'
interface ChallengeChatData {
  posts: Post[] | null
  checkIns: CheckIn[]
  checkInsByDay: Record<string, number>
}

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  const user = await requireCurrentUser(args)
  const { params } = args
  if (!params.id) {
    return null
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
      user: {
        include: {
          profile: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  // get list of checkins with bodies
  const checkIns = await prisma.checkIn.findMany({
    where: {
      challengeId: Number(params.id),
      OR: [
        { body: { not: null } },
        { imageMeta: { not: null } },
        { videoMeta: { not: null } }
      ]
    },
    include: {
      user: {
        include: {
          profile: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  // group posts and checkins by date
  const groupedData: Record<string, { posts: Post[], checkIns: { empty: CheckIn[], nonEmpty: CheckIn[] } }> = {}

  posts.forEach(post => {
    const date = post.createdAt.toISOString().split('T')[0]
    if (!groupedData[date]) {
      groupedData[date] = { posts: [], checkIns: { empty: [], nonEmpty: [] } }
    }
    groupedData[date].posts.push(post)
  })

  checkIns.forEach(checkIn => {
    const date = checkIn.createdAt.toISOString().split('T')[0]
    if (!groupedData[date]) {
      groupedData[date] = { posts: [], checkIns: { empty: [], nonEmpty: [] } }
    }
    if (checkIn.body !== null || checkIn.imageMeta !== null || checkIn.videoMeta !== null) {
      groupedData[date].checkIns.nonEmpty.push(checkIn)
    } else {
      groupedData[date].checkIns.empty.push(checkIn)
    }
  })
  // fetch liked check-in ids
  const likedCheckIns = await prisma.like.findMany({
    where: {
      userId: user?.id,
      checkinId: { not: null }
    },
    select: {
      checkinId: true
    }
  })
  const likedCheckInIds = likedCheckIns.map(like => like.checkinId)

  const data: ChallengeChatData = { posts, checkIns, groupedData, likedCheckInIds }
  return data
}
export default function ViewChallengeChat (): JSX.Element {
  const data = useLoaderData<typeof loader>()
  const bottomRef = useRef<HTMLDivElement>(null)
  if (!data) {
    return <p>No data.</p>
  }
  // scroll to bottom of the page when the data changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data])

  return (
    <div className='max-w-2xl'>
      {Object.entries(data.groupedData).map(([date, { posts, checkIns }]) => (
        <div key={date}>
          {posts.map((post: Post) => (
            <div key={`post-${post.id}`} className='max-w-sm md:max-w-xl mb-6'>
              <CardPost post={post} hideMeta={false} fullPost={false} isChat={true}/>

            </div>
          ))}
          <CheckinsList checkIns={checkIns.nonEmpty} likes={data.likedCheckInIds} allowComments={true} />
          {/* Render empty check-ins if needed */}
        </div>
      ))}

    </div>
  )
}
