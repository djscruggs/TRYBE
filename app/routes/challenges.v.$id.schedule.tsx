import { JSX } from 'react'
import { useLoaderData } from 'react-router';
import { requireCurrentUser } from '~/models/auth.server'
import { type Post } from '@prisma/client'
import { type MetaFunction, type LoaderFunction, type LoaderFunctionArgs } from 'react-router';
import { prisma } from '~/models/prisma.server'
import ChallengeSchedule from '~/components/challengeSchedule'
import { useMemberContext } from '~/contexts/MemberContext'

export const meta: MetaFunction = () => {
  return [
    { title: 'Schedule' },
    {
      property: 'og:title',
      content: 'Schedule'
    }
  ]
}
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
    ],
    include: {user:true}
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
export default function Schedule (): JSX.Element {
  const { challenge } = useMemberContext()
  const { posts } = useLoaderData<typeof loader>() as unknown as ChallengeScheduleData
  return (
    <>
    {challenge && posts &&
      <ChallengeSchedule challenge={challenge} posts={posts} key={challenge.id} isSchedule={true} />
    }
    </>
  )
}
