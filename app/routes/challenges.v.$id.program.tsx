import { useLoaderData, useRouteLoaderData, useNavigate, Link } from '@remix-run/react'
import { requireCurrentUser } from '~/models/auth.server'
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
export default function Program (): JSX.Element {
  const { challenge } = useRouteLoaderData<typeof useRouteLoaderData>('routes/challenges.v.$id') as { challenge: Challenge }
  const { posts } = useLoaderData<typeof loader>() as ChallengeScheduleData

  return (
    <ChallengeSchedule challenge={challenge} posts={posts} isSchedule={false} />
  )
}
