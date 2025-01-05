import { useLoaderData, useRouteLoaderData, Link } from '@remix-run/react'
import { useContext } from 'react'
import { loadChallenge } from '~/models/challenge.server'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { type MetaFunction, type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { prisma } from '~/models/prisma.server'
import type { Challenge, MemberChallenge, Post } from '~/utils/types'
import ChallengeSchedule from '~/components/challengeSchedule'
import { getCurrentUser } from '~/models/auth.server'

export const meta: MetaFunction = () => {
  return [
    { title: 'Program' },
    {
      property: 'og:title',
      content: 'Program'
    }
  ]
}

interface ChallengeScheduleData {
  posts: Post[]
  membership: MemberChallenge | null
}
export const loader: LoaderFunction = async (args: LoaderFunctionArgs): Promise<ChallengeScheduleData> => {
  const { params } = args
  const currentUser = await getCurrentUser(args)
  const challenge: Challenge | null = await loadChallenge(Number(params.id))
  if (!challenge) {
    return { posts: [], membership: null }
  }
  const posts = await prisma.post.findMany({
    where: {
      challengeId: Number(params.id)
    },
    orderBy: [
      { publishAt: 'asc' },
      { createdAt: 'asc' }
    ]
  }) as Post[]
  let membership: MemberChallenge | null = null
  if (currentUser) {
    membership = await prisma.memberChallenge.findFirst({
      where: {
        challengeId: Number(params.id),
        userId: currentUser?.id
      },
      include: {
        user: {
          include: {
            profile: true
          }
        },
        challenge: true
      }
    }) as MemberChallenge | null
  }
  const data: ChallengeScheduleData = {
    posts: posts.map(post => ({
      ...post,
      createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
      publishAt: post.publishAt ? new Date(post.publishAt) : null
    })),
    membership
  }
  return data
}
export default function Program (): JSX.Element {
  const { challenge } = useRouteLoaderData<typeof useRouteLoaderData>('routes/challenges.v.$id') as { challenge: Challenge }
  const { posts, membership } = useLoaderData<typeof loader>() as ChallengeScheduleData
  const { currentUser } = useContext(CurrentUserContext)
  return (
    <>
      {posts.length === 0 &&
        <div className='mt-6 max-w-lg text-center '>
          {challenge.userId === currentUser?.id
            ? <div>You have not scheduled content. <Link className='text-red underline' to={`/challenges/v/${challenge.id}/schedule`}>Edit schedule.</Link></div>
            : <div>Schedule has not been published yet.</div>
          }
        </div>
      }
      <div className='flex flex-col justify-center mt-20   w-full max-w-lg md:max-w-xl'>
        <ChallengeSchedule challenge={challenge} posts={posts} key={challenge.id} isSchedule={false} membership={membership} />
      </div>
    </>
  )
}
