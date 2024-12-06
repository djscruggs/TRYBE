import { prisma } from './prisma.server'
import { type Prisma } from '@prisma/client'
import type { Challenge, ChallengeSummary, MemberChallenge, CheckIn, ChallengeWithHost } from '~/utils/types'
import { addDays, isFriday, isSaturday } from 'date-fns'
import { deleteFromCloudinary } from '~/utils/uploadFile'

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
  return newChallenge as Challenge
}
export const updateChallenge = async (challenge: prisma.challengeCreateInput): Promise<Challenge> => {
  const { id, userId, ...data } = challenge
  return await prisma.challenge.update({
    where: { id },
    data
  }) as unknown as Challenge
}
export const loadChallenge = async (challengeId: number, userId?: number): Promise<Challenge | null> => {
  const id = Number(challengeId)
  const where: any = { id }
  if (userId) {
    where.userId = userId
  }
  const challenge = await prisma.challenge.findUnique({
    where,
    include: {
      categories: true
    }
  })
  return challenge as Challenge | null
}
export const loadChallengeWithHost = async (challengeId: number): Promise<ChallengeWithHost | null> => {
  const id = Number(challengeId)
  const where: any = { id }
  const challenge = await prisma.challenge.findUnique({
    where,
    include: {
      user: {
        include: {
          profile: true
        }
      },
      categories: true
    }
  })
  return challenge as ChallengeWithHost | null
}
export const loadChallengeSummary = async (challengeId: string | number): Promise<ChallengeSummary> => {
  const id = Number(challengeId)
  const challenge = await prisma.challenge.findUnique({
    where: {
      id
    },
    include: {
      _count: {
        select: { members: true, comments: true, likes: true }
      },
      categories: {
        select: {
          category: true
        }
      }
    }
  }) as unknown as ChallengeSummary

  challenge.categories = challenge.categories.map(c => c.category)
  return challenge
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

export const deleteChallenge = async (challengeId: string | number, userId: string | number): Promise<prisma.challenge> => {
  const id = Number(challengeId)
  const uid = Number(userId)
  // load the challenge first so you can get a handle to the coverPhoto
  const challenge = await prisma.challenge.findUnique({
    where: { id }
  }) as unknown as Challenge
  if (!challenge) {
    throw new Error('Challenge not found')
  }
  try {
    if (challenge?.coverPhotoMeta?.public_id) {
      await deleteFromCloudinary(String(challenge.coverPhotoMeta.public_id), 'image')
    }
  } catch (error: any) {
    console.error('error deleting coverPhoto', error)
  }
  try {
    if (challenge?.videoMeta?.public_id) {
      await deleteFromCloudinary(String(challenge.videoMeta.public_id), 'video')
    }
  } catch (error: any) {
    console.error('error deleting video', error)
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
  }) as unknown as Challenge[]
}

interface FetchChallengeSummariesParams {
  userId?: number
  range?: string
  category?: string | number | null
  SELF_LED?: boolean
}

export const fetchChallengeSummaries = async ({
  userId,
  range,
  category,
  SELF_LED
}: FetchChallengeSummariesParams): Promise<ChallengeSummary[]> => {
  const uid = userId ? Number(userId) : undefined
  const where: any[] = [{ public: true }]
  switch (range) {
    case 'upcoming':
      where.push({ startAt: { gt: new Date() }, status: 'PUBLISHED' })
      break
    case 'archived':
      where.push({ OR: [{ endAt: { lt: new Date() } }, { status: 'ARCHIVED' }] })
      break
    case 'active':
      where.push({ startAt: { lt: new Date() }, status: 'PUBLISHED' })
      where.push({ endAt: { gte: new Date() } })
      break
  }
  if (SELF_LED) {
    where.push({ type: 'SELF_LED' })
  }
  if (uid) {
    where.push({ userId: uid })
  }
  let queryCategory: number[] = []
  if (typeof category === 'number') {
    queryCategory = [category]
  } else if (typeof category === 'string') {
    const categoryIds = await prisma.category.findMany({
      where: { name: { in: category.split(',') } }
    })
    if (categoryIds) {
      queryCategory = categoryIds.map(c => c.id)
    }
    if (queryCategory.length > 0) {
      where.push({
        categories: {
          some: {
            categoryId: {
              in: queryCategory
            }
          }
        }
      })
    }
  }

  const params: Prisma.ChallengeFindManyArgs = {
    where: {
      AND: where
    },
    include: {
      _count: {
        select: { members: true, comments: true, likes: true }
      },
      categories: true
    }
  }
  const challenges = await prisma.challenge.findMany(params)

  return challenges as unknown as ChallengeSummary[]
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
export async function updateCheckin (checkin: CheckIn): Promise<CheckIn> {
  const { id, memberChallenge, challenge, user, ...data } = checkin
  return await prisma.checkIn.update({
    where: { id },
    data
  }) as unknown as CheckIn
}
interface FetchUserChallengesAndMembershipsParams {
  userId: number
  SELF_LED?: boolean
}
export const fetchUserChallengesAndMemberships = async ({ userId, SELF_LED }: FetchUserChallengesAndMembershipsParams): Promise<ChallengeSummary[]> => {
  const uid = Number(userId)
  const memberChallengeWhere: Prisma.MemberChallengeWhereInput = { userId: uid }
  const memberChallenges = await prisma.memberChallenge.findMany(
    {
      where: memberChallengeWhere,
      include: {
        challenge: true
      }
    }
  )
  const memberships = memberChallenges.map(memberChallenge => {
    const challenge = memberChallenge.challenge as unknown as ChallengeSummary
    challenge.isMember = true
    return challenge
  })
  const challengeWhere: Prisma.ChallengeWhereInput = { userId: uid }
  if (SELF_LED) {
    challengeWhere.type = 'SELF_LED'
  }
  const ownedChallenges = await prisma.challenge.findMany({
    where: challengeWhere,
    include: {
      _count: {
        select: { members: true, comments: true, likes: true }
      },
      user: {
        include: {
          profile: true
        }
      }
    }
  })

  // de-dupe any overlap
  const uniqueChallenges = [...new Map([...ownedChallenges, ...memberships].map(item => [item.id, item])).values()] as ChallengeSummary[]
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
  }) as unknown as ChallengeSummary[]
}
export const fetchUserMemberships = async (userId: string | number): Promise<MemberChallenge[]> => {
  const uid = Number(userId)
  const memberships = await prisma.memberChallenge.findMany({
    where: { userId: uid },
    include: {
      challenge: true,
      user: {
        include: {
          profile: true
        }
      }
    }
  }) as unknown as MemberChallenge[]

  // Deduplicate memberships based on userId and challengeId
  const uniqueMemberships = Array.from(new Map(memberships.map(m => [`${m.userId}-${m.challengeId}`, m])).values())

  return uniqueMemberships
}
export const loadMemberChallenge = async (userId: number, challengeId: number): Promise<MemberChallenge | null> => {
  const uid = Number(userId)
  const cid = Number(challengeId)
  return await prisma.memberChallenge.findFirst({
    where: {
      userId: Number(uid),
      challengeId: Number(cid)
    },
    include: {
      _count: {
        select: { checkIns: true }
      }
    }
  }) as MemberChallenge | null
}
export const fetchChallengeMembers = async (cId: string | number): Promise<MemberChallenge[]> => {
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
  return await prisma.memberChallenge.findMany(params) as unknown as MemberChallenge[]
}
export const joinChallenge = async (userId: number, challengeId: number): Promise<MemberChallenge> => {
  // Check if the member challenge already exists
  const existingMemberChallenge = await prisma.memberChallenge.findFirst({
    where: {
      userId,
      challengeId
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  if (existingMemberChallenge) {
    return existingMemberChallenge
  }

  // If not, create a new member challenge
  return await prisma.memberChallenge.create({
    data: {
      userId,
      challengeId
    }
  }) as unknown as MemberChallenge
}
export const unjoinChallenge = async (userId: number, challengeId: number): Promise<MemberChallenge> => {
  return await prisma.memberChallenge.deleteMany({
    where: {
      userId,
      challengeId
    }
  }) as unknown as MemberChallenge
}
export async function fetchCheckIns ({ userId, challengeId, orderBy = 'desc' }: { userId?: number, challengeId?: number, orderBy?: 'asc' | 'desc' }): Promise<CheckIn[]> {
  const where: any = {}
  if (userId) {
    where.userId = userId
  }
  if (challengeId) {
    where.challengeId = challengeId
  }
  return await prisma.checkIn.findMany({
    where,
    orderBy: {
      createdAt: orderBy
    },
    include: {
      user: {
        include: {
          profile: true
        }
      }
    }
  }) as unknown as CheckIn[]
}
export const loadCheckIn = async (checkInId: number): Promise<CheckIn | null> => {
  const id = Number(checkInId)
  return await prisma.checkIn.findUnique({
    where: { id }
  }) as CheckIn | null
}
export const deleteCheckIn = async (checkInId: number): Promise<CheckIn> => {
  const id = Number(checkInId)
  // check to see if there are any image or video to delete
  const checkIn = await loadCheckIn(id)
  if (checkIn?.videoMeta?.public_id) {
    await deleteFromCloudinary(checkIn.videoMeta.public_id, 'video')
  }
  if (checkIn?.imageMeta?.public_id) {
    await deleteFromCloudinary(checkIn.imageMeta.public_id, 'image')
  }

  const deleted = await prisma.checkIn.delete({
    where: {
      id
    }
  })
  return deleted
}
