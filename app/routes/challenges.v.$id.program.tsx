import { useLoaderData, useRouteLoaderData, Link } from 'react-router';
import { useContext, useState, useEffect } from 'react'
import { loadChallenge } from '~/models/challenge.server'
import { CurrentUserContext } from '~/contexts/CurrentUserContext'
import { type MetaFunction, type LoaderFunction, type LoaderFunctionArgs } from 'react-router';
import { prisma } from '~/models/prisma.server'
import type { Challenge, MemberChallenge, Post } from '~/utils/types'
import ChallengeSchedule from '~/components/challengeSchedule'
import { getCurrentUser } from '~/models/auth.server'
import type { Prisma } from '@prisma/client'
import { useMemberContext } from '~/contexts/MemberContext'

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
  const orderBy: Prisma.PostOrderByWithRelationInput[] = challenge.type === 'SELF_LED'
    ? [{ publishOnDayNumber: 'asc' }]
    : [{ publishAt: 'asc' }]

  const posts = await prisma.post.findMany({
    where: {
      challengeId: Number(params.id)
    },
    orderBy: [
      ...orderBy,
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
  const { membership, challenge } = useMemberContext()
  const { currentUser } = useContext(CurrentUserContext)

  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    const fetchPosts = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/challenges/v/${challenge?.id}/program`)
        if (!response.ok) {
          throw new Error('Failed to fetch posts')
        }
        const data = await response.Response.json()
        setPosts(data.posts as Post[])
      } catch (error) {
        console.error('Error fetching posts:', error)
      }
    }

    void fetchPosts()
  }, [challenge?.id])

  return (
    <>
      <div className='flex flex-col justify-center mt-6 w-full max-w-lg md:max-w-xl'>
        {posts.length === 0 &&
          <div className='max-w-lg text-center '>
            {challenge.userId === currentUser?.id
              ? <div>You have not scheduled content. <Link className='text-red underline' to={`/challenges/v/${challenge.id}/schedule`}>Edit schedule.</Link></div>
              : <div>Schedule has not been published yet.</div>
            }
          </div>
        }
        <ChallengeSchedule challenge={challenge} posts={posts} key={challenge.id} isSchedule={false} membership={membership} />
      </div>
    </>
  )
}
