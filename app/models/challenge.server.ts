import { prisma } from './prisma.server'
import type { Challenge, ChallengeSummary, MemberChallenge } from '~/utils/types'
import z from 'zod'
import { addDays, isFriday, isSaturday } from 'date-fns'

export const createChallenge = async (challenge: prisma.challengeCreateInput): Promise<Challenge> => {
  const newChallenge = await prisma.challenge.create({
    data: challenge
  })
  // also create a membership for the user that created the challenge
  await prisma.memberChallenge.create({
    data: {
      userId: challenge.userId,
      challengeId: newChallenge.id
    }
  })
  return newChallenge
}
export const updateChallenge = async (challenge: prisma.challengeCreateInput): Promise<Challenge> => {
  const { id, userId, ...data } = challenge
  return await prisma.challenge.update({
    where: { id },
    data
  })
}
export const loadChallenge = async (challengeId: number, userId?: number): Promise<Challenge | null> => {
  const id = Number(challengeId)
  const where: any = { id }
  if (userId) {
    where.userId = userId
  }
  return await prisma.challenge.findUnique({
    where
  })
}
export const loadChallengeSummary = async (challengeId: string | number): Promise<ChallengeSummary> => {
  console.log('loadChallengeSummary id is', challengeId)
  const id = Number(challengeId)
  return await prisma.challenge.findUnique({
    where: {
      id
    },
    include: {
      _count: {
        select: { members: true, comments: true, likes: true }
      }
    }
  })
}
export const loadUserCreatedChallenges = async (userId: string | number) => {
  const uid = Number(userId)
  return await prisma.challenge.findMany({
    where: {
      userId: uid
    },
    include: {
      _count: {
        select: { members: true }
      }
    }
  })
}
export const deleteChallenge = async (challengeId: string | number, userId: string | number): Promise<Challenge> => {
  const id = Number(challengeId)
  const uid = Number(userId)
  // load the challenge first so you can get a handle to the coverPhoto
  const challenge = await prisma.challenge.findUnique({
    where: { id }
  })
  if (challenge?.coverPhoto) {
    try {
      const file = `${process.cwd()}/public${challenge.coverPhoto}`
      const fs = require('fs')
      await fs.unlink(file, (error: Error) => {
        if (error) {
          if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            console.error('file does  not  exist', file)
          } else {
            throw error
          }
        }
      })
    } catch (error: any) {
      return error
    }
  }
  return await prisma.challenge.delete({
    where: {
      id,
      userId: uid
    }
  })
}
export const fetchChallenges = async (userId: string | number): Promise<Challenge[]> => {
  const uid = userId ? Number(userId) : undefined
  return await prisma.challenge.findMany({
    where: {
      userId: uid
    }
  })
}
export const fetchChallengeSummaries = async (userId?: string | number): Promise<ChallengeSummary[]> => {
  const uid = userId ? Number(userId) : undefined
  const where: any[] = [{ public: true }]
  if (uid) {
    where.push({ userId: uid })
  }
  const params: prisma.challengeFindManyArgs = {
    where: {
      OR: where
    },
    include: {
      _count: {
        select: { members: true, comments: true, likes: true }
      }
    }
  }
  return await prisma.challenge.findMany(params)
}
export function calculateNextCheckin (challenge: Challenge): Date {
  const today = new Date()
  const frequency = challenge.frequency
  let toAdd = 1
  switch (frequency) {
    case 'WEEKLY':
      toAdd = 7
      break
    case 'ALTERNATING':
      toAdd = 2
      break
    case 'WEEKDAYS':
      if (isFriday(today)) {
        toAdd = 3
      } else if (isSaturday(today)) {
        toAdd = 2
      }
      break
  }
  const nextCheckin = addDays(today, toAdd)
  return nextCheckin
}
export const fetchUserChallengesAndMemberships = async (userId: string | number): Promise<ChallengeSummary[]> => {
  const uid = Number(userId)
  const ownedChallenges = await prisma.challenge.findMany({
    where: {
      userId: uid
    },
    include: {
      _count: {
        select: { members: true, comments: true, likes: true }
      }
    }
  })
  const memberChallenges = await prisma.memberChallenge.findMany(
    {
      where: { userId: uid },
      include: {
        challenge: true
      }
    }
  )
  const memberships = memberChallenges.map(memberChallenge => {
    memberChallenge.challenge.isMember = true as ChallengeSummary['isMember']
    return memberChallenge.challenge
  })
  // de-dupe any overlap
  const uniqueChallenges = [...new Map([...ownedChallenges, ...memberships].map(item => [item.id, item])).values()]
  return uniqueChallenges
}
export const fetchUserChallenges = async (userId: string | number, showPrivate = false): Promise<ChallengeSummary[]> => {
  const uid = Number(userId)
  return await prisma.challenge.findMany({
    where: {
      userId: uid
    },
    include: {
      _count: {
        select: { members: true, comments: true, likes: true }
      }
    }
  })
}
export const fetchUserMemberships = async (userId: string | number, showPrivate = false): Promise<MemberChallenge[]> => {
  const uid = Number(userId)
  return await prisma.memberChallenge.findMany(
    {
      where: { userId: uid },
      include: {
        challenge: true
      }
    }
  )
}
export const fetchChallengeMembers = async (cId: string | number): Promise<any> => {
  const params: prisma.memberChallengeFindManyArgs = {
    where: { challengeId: Number(cId.toString()) },
    include: {
      challenge: true,
      user: {
        include: {
          profile: true
        }
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return await prisma.memberChallenge.findMany(params)
}
export const joinChallenge = async (userId: number, challengeId: number): Promise<any> => {
  return await prisma.memberChallenge.create({
    data: {
      userId,
      challengeId
    }
  })
}
export const unjoinChallenge = async (userId: number, challengeId: number): Promise<any> => {
  return await prisma.memberChallenge.delete({
    where: {
      challengeId_userId: {
        userId,
        challengeId
      }
    }
  })
}
export function getSchemaDefaults<Schema extends z.AnyZodObject> (schema: Schema) {
  return Object.fromEntries(
    Object.entries(schema.shape).map(([key, value]) => {
      if (value instanceof z.ZodDefault) return [key, value._def.defaultValue()]
      return [key, undefined]
    })
  )
}
export const challengeSchema =
                    z.object({
                      name: z
                        .string()
                        .min(1, { message: 'Challenge name is required' }),
                      description: z
                        .string({ invalid_type_error: 'Wrong type' })
                        .min(1, { message: 'Description is required' }),
                      mission: z
                        .string({ invalid_type_error: 'Wrong type' })
                        .min(1, { message: 'Mission is required' }),
                      startAt: z
                        .date({ required_error: 'Please select a date' }),
                      endAt: z
                        .date()
                        .or(z.literal(''))
                        .nullable(),
                      frequency: z
                        .enum(['DAILY', 'WEEKDAYS', 'ALTERNATING', 'WEEKLY', 'CUSTOM']),
                      coverPhoto: z
                        .string()
                        .nullable()
                        .optional(),
                      icon: z
                        .string()
                        .nullable()
                        .optional(),
                      color: z
                        .string()
                        .nullable()
                        .optional(),
                      reminders: z
                        .boolean()
                        .default(false),
                      syncCalendar: z
                        .boolean()
                        .default(false),
                      publishAt: z
                        .string()
                        .pipe(z.coerce.date())
                        .or(z.date())
                        .or(z.literal(''))
                        .nullable()
                        .optional(),
                      published: z
                        .boolean()
                        .default(false),
                      userId: z
                        .coerce
                        .bigint()
                    })
