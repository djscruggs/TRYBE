import { useLoaderData, useRouteLoaderData, Link } from '@remix-run/react'
import { useContext } from 'react'
import { requireCurrentUser } from '~/models/auth.server'
import { loadChallenge } from '~/models/challenge.server'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { type Post } from '@prisma/client'
import { type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { prisma } from '~/models/prisma.server'
import { type Challenge } from '~/utils/types'
import ChallengeSchedule from '~/components/challengeSchedule'

interface ChallengeScheduleData {
  posts: Post[]
}
export const loader: LoaderFunction = async (args: LoaderFunctionArgs): Promise<ChallengeScheduleData> => {
  await requireCurrentUser(args)
  const { params } = args
  const challenge: Challenge | null = await loadChallenge(Number(params.id))
  if (!challenge) {
    return { posts: [] }
  }
  const posts = await prisma.post.findMany({
    where: {
      challengeId: challenge.id,
      publishAt: {
        gte: challenge.startAt?.toISOString(),
        lte: challenge.endAt?.toISOString()
      }
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
export default function Program (): JSX.Element {
  const { challenge } = useRouteLoaderData<typeof useRouteLoaderData>('routes/challenges.v.$id') as { challenge: Challenge }
  const { posts } = useLoaderData<typeof loader>() as ChallengeScheduleData
  const { currentUser } = useContext(CurrentUserContext)
  return (
    <>
      {posts.length === 0 &&
        <div className='my-6 max-w-lg text-center '>
          {challenge.userId === currentUser?.id
            ? <>You have not scheduled content. <Link to={`/challenges/v/${challenge.id}/schedule`}>Edit schedule.</Link></>
            : <>Schedule has not been published yet.</>
          }
        </div>
      }
      <ChallengeSchedule challenge={challenge} posts={posts} key={challenge.id} isSchedule={false} />
    </>
  )
}
