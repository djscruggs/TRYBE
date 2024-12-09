// api.cron.test.ts
import { prisma } from '../../app/models/prisma.server'
import { mailPost } from '../../app/utils/mailer'
import { sendScheduledPosts, sendDayNumberPosts } from '../../app/routes/api.cron'
import { jest } from '@jest/globals'

jest.mock('../../app/utils/mailer')

// Mock the prisma methods
jest.mock('../../app/models/prisma.server', () => {
  return {
    prisma: {
      challenge: {
        findMany: jest.fn()
      },
      post: {
        findMany: jest.fn(),
        update: jest.fn()
      },
      memberChallenge: {
        update: jest.fn()
      }
    }
  }
})

const mockedPrisma = prisma as jest.Mocked<typeof prisma>
const mockedMailPost = jest.mocked(mailPost, { shallow: true })

describe('sendScheduledPosts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should send emails for scheduled posts and update notificationSentOn', async () => {
    // Mock data
    const mockPosts = [
      {
        id: 1,
        published: true,
        challengeId: 1,
        notifyMembers: true,
        notificationSentOn: null,
        publishAt: new Date(Date.now() - 1000),
        userId: 1,
        public: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { email: 'author@example.com', profile: { firstName: 'John', lastName: 'Doe' } },
        challenge: {
          members: [
            { user: { email: 'member@example.com', profile: { firstName: 'Jane', lastName: 'Doe' } } }
          ]
        }
      }
    ]

    mockedPrisma.post.findMany.mockResolvedValue(mockPosts)
    mockedMailPost.mockResolvedValue(undefined)
    mockedPrisma.post.update.mockResolvedValue(mockPosts[0])

    const result = await sendScheduledPosts()

    expect(mockedPrisma.post.findMany).toHaveBeenCalled()
    expect(mockedMailPost).toHaveBeenCalledTimes(1)
    expect(mockedPrisma.post.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { notificationSentOn: expect.any(Date) }
    })
    expect(result).toEqual(mockPosts)
  })
})

describe('sendDayNumberPosts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should send emails for day number posts and increment dayNumber', async () => {
    // Mock data
    const mockChallenges = [
      {
        id: 1,
        status: 'PUBLISHED',
        type: 'SELF_LED',
        members: [
          { id: 1, dayNumber: 1, user: { email: 'member@example.com', profile: { firstName: 'Jane', lastName: 'Doe' } } }
        ]
      }
    ]

    const mockPosts = [
      {
        id: 1,
        challengeId: 1,
        publishOnDayNumber: 1,
        published: true,
        user: { email: 'author@example.com', profile: { firstName: 'John', lastName: 'Doe' } }
      }
    ]

    mockedPrisma.challenge.findMany.mockResolvedValue(mockChallenges)
    mockedPrisma.post.findMany.mockResolvedValue(mockPosts)
    mockedMailPost.mockResolvedValue(undefined)
    mockedPrisma.memberChallenge.update.mockResolvedValue(mockChallenges[0].members[0])

    const result = await sendDayNumberPosts()

    expect(mockedPrisma.challenge.findMany).toHaveBeenCalled()
    expect(mockedPrisma.post.findMany).toHaveBeenCalled()
    expect(mockedMailPost).toHaveBeenCalledTimes(1)
    expect(mockedPrisma.memberChallenge.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { dayNumber: 2 }
    })
    expect(result).toEqual(mockPosts)
  })
})
