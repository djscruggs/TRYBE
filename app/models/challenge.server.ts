import { prisma, PrismaClient } from './prisma.server'
import { type ChallengeType, type Prisma } from '@prisma/client'
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
export const updateChallenge = async (challenge: Partial<Challenge>): Promise<Challenge> => {
  const { id, userId, ...data } = challenge
  const updatedChallenge = await prisma.challenge.update({
    where: { id },
    data: data as Prisma.ChallengeUpdateInput
  }) as unknown as Challenge
  // update startAt on memberChallenges if it is set
  if (data.startAt) {
    void prisma.memberChallenge.updateMany({
      where: { challengeId: id },
      data: { startAt: data.startAt }
    })
  }
  return updatedChallenge
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
      categories: {
        select: {
          category: true
        }
      }
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
      user: {
        include: {
          profile: true
        }
      },
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

  return challenge
}
export const loadUserCreatedChallenges = async (userId: string | number): Promise<Challenge[]> => {
  const uid = Number(userId)
  return await prisma.challenge.findMany({
    where: {
      userId: uid
    },
    include: {
      _count: {
        select: { members: true }
      },
      user: {
        include: {
          profile: true
        }
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
  }) as unknown as Challenge
}
export const fetchChallenges = async (userId: string | number): Promise<Challenge[]> => {
  const uid = userId ? Number(userId) : undefined
  return await prisma.challenge.findMany({
    where: {
      userId: uid
    },
    include: {
      categories: {
        select: {
          category: true
        }
      }
    }
  }) as unknown as Challenge[]
}

interface FetchChallengeSummariesParams {
  userId?: number | null
  range?: string
  category?: string | number | null
  type?: string
}

export const fetchChallengeSummaries = async ({
  userId,
  range,
  category,
  type = 'all'
}: FetchChallengeSummariesParams): Promise<ChallengeSummary[]> => {
  // console.log('fetchChallengeSummaries', { userId, range, category, type })
  const uid = userId ? Number(userId) : undefined
  const where: any[] = []
  if (uid) {
    where.push({ userId: uid })
  } else if (range !== 'all') {
    where.push({ public: true })
  }
  if (range !== 'all') {
    where.push({ status: 'PUBLISHED' })
  }
  if (type === 'SELF_LED') {
    where.push({ type: 'SELF_LED' })
  } else {
    switch (range) {
      case 'upcoming': {
        const upcomingCondition = { startAt: { gt: new Date() } }
        if (type !== 'all') {
          where.push({
            OR: [
              upcomingCondition,
              { type: type.toUpperCase() }
            ]
          })
        } else {
          where.push({
            OR: [
              upcomingCondition,
              { type: 'SELF_LED' }
            ]
          })
        }
        break
      }
      case 'archived':
        where.push({ OR: [{ endAt: { lt: new Date() } }, { status: 'ARCHIVED' }] })
        break
      case 'active': {
        const activeCondition = {
          AND: [
            { startAt: { lt: new Date() } },
            { endAt: { gte: new Date() } }
          ]
        }
        if (type !== 'all') {
          where.push({
            OR: [
              activeCondition,
              { type: 'SELF_LED' }
            ]
          })
        } else {
          where.push(activeCondition)
        }
        break
      }
    }
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
  // console.log('where', JSON.stringify(where, null, 3))
  const params: Prisma.ChallengeFindManyArgs = {
    where: {
      AND: where
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
    data: data as Prisma.CheckInUpdateInput
  }) as unknown as CheckIn
}
interface FetchUserChallengesAndMembershipsParams {
  userId: number | null
  type?: string
}
export const fetchUserChallengesAndMemberships = async ({ userId, type = 'all' }: FetchUserChallengesAndMembershipsParams): Promise<ChallengeSummary[]> => {
  const uid = Number(userId)
  const memberChallenges = await prisma.memberChallenge.findMany(
    {
      where: { userId: uid },
      include: {
        challenge: {
          include: {
            categories: {
              select: {
                category: true
              }
            }
          }
        }
      }
    }
  )
  const memberships = memberChallenges.map(memberChallenge => {
    const challenge = memberChallenge.challenge as unknown as ChallengeSummary
    challenge.isMember = true
    return challenge
  })
  const challengeWhere: Prisma.ChallengeWhereInput = { userId: uid }
  if (type !== 'all') {
    challengeWhere.type = type.toUpperCase() as ChallengeType
  }
  const ownedChallenges = await fetchUserChallenges(uid)
  const uniqueChallenges = [...new Map([...ownedChallenges, ...memberships].map(item => [item.id, item])).values()] as ChallengeSummary[]
  return uniqueChallenges
}
export const fetchUserChallenges = async (userId: string | number): Promise<ChallengeSummary[]> => {
  const uid = Number(userId)
  return await prisma.challenge.findMany({
    where: {
      userId: uid
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
  }) as unknown as ChallengeSummary[]
}
export const fetchUserMemberships = async (userId: string | number): Promise<MemberChallenge[]> => {
  const uid = Number(userId)
  const memberships = await prisma.memberChallenge.findMany({
    where: { userId: uid },
    include: {
      challenge: {
        include: {
          categories: {
            select: {
              category: true
            }
          }
        }
      },
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
  if (!userId || !challengeId) {
    return null
  }
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
      },
      challenge: {
        include: {
          categories: {
            select: {
              category: true
            }
          }
        }
      }
    }
  }) as MemberChallenge | null
}
export const fetchChallengeMembers = async (cId: string | number): Promise<MemberChallenge[]> => {
  const params: Prisma.MemberChallengeFindManyArgs = {
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
export const joinChallenge = async (userId: number, challengeId: number, startAt?: Date, notificationHour?: number, notificationMinute?: number): Promise<Prisma.MemberChallenge> => {
  // Check if the member challenge already exists
  const existingMemberChallenge = await prisma.memberChallenge.findFirst({
    where: {
      userId,
      challengeId
    },
    include: {
      challenge: true,
      user: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  if (existingMemberChallenge) {
    return existingMemberChallenge
  }
  // otehrwise, create a new member challenge
  const challenge = await loadChallenge(challengeId)

  if (!challenge) {
    throw new Error('Challenge not found')
  }

  if (challenge.type === 'SELF_LED') {
    if (startAt && isNaN(startAt.getTime())) {
      throw new Error('Invalid date: startAt must be a valid date string')
    }

    if (notificationHour != null && (notificationHour < 0 || notificationHour > 23)) {
      throw new Error('Invalid time: notificationHour must be between 0 and 23')
    }

    if (notificationMinute != null && (notificationMinute < 0 || notificationMinute > 59)) {
      throw new Error('Invalid time: notificationMinute must be between 0 and 59')
    }
  } else {
    startAt = challenge.startAt ? challenge.startAt : undefined
  }
  const data: Prisma.MemberChallengeCreateInput = {
    user: {
      connect: { id: userId }
    },
    challenge: {
      connect: { id: challengeId }
    },
    startAt,
    notificationHour,
    notificationMinute
  }

  return await prisma.memberChallenge.create({
    data
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
    where: { id },
    include: {
      challenge: true,
      user: {
        include: {
          profile: true
        }
      }
    }
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
