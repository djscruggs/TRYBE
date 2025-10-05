import {
  loadChallenge
} from '~/models/challenge.server'
import type { MemberChallenge, Challenge, Post } from '~/utils/types'
import { type LoaderFunction, type LoaderFunctionArgs } from 'react-router';
import { getCurrentUser } from '~/models/auth.server'
import { prisma } from '~/models/prisma.server'
import type { Prisma } from '@prisma/client'

interface ChallengeScheduleData {
  posts: Post[]
}

export const loader: LoaderFunction = async (args: LoaderFunctionArgs): Promise<ChallengeScheduleData> => {
  const { params } = args
  const challenge: Challenge | null = await loadChallenge(Number(params.id))
  if (!challenge) {
    return { posts: [] }
  }
  const orderBy: Prisma.PostOrderByWithRelationInput[] = challenge.type === 'SELF_LED'
    ? [{ publishOnDayNumber: 'asc' }]
    : [{ publishAt: 'asc' }]

  const posts = await prisma.post.findMany({
    where: {
      // challengeId: Number(params.id),
      publishOnDayNumber: { gt: 0 }
    },
    orderBy: [
      ...orderBy,
      { createdAt: 'asc' }
    ]
  }) as Post[]
  const data: ChallengeScheduleData = {
    posts: posts.map(post => ({
      ...post,
      createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
      publishAt: post.publishAt ? new Date(post.publishAt) : null
    }))
  }
  return data
}
