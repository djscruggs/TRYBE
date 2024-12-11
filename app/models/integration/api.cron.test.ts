// Your test cases here
import { createChallenge } from '~/models/challenge.server'
import { prisma } from '~/models/prisma.server'
import { loader } from '~/routes/api.cron'

describe('testing api/cron', async () => {
  // delete all the challenges and posts before this suite of tests
  await prisma.post.deleteMany()
  await prisma.challenge.deleteMany()
  // create a scheduled challenge
  await createChallenge({
    name: 'test challenge',
    description: 'test challenge',
    type: 'SCHEDULED',
    userId: 1,
    status: 'PUBLISHED',
    reminders: true,
    startAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    endAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    frequency: 'DAILY',
    public: true,
    posts: {
      create: {
        title: 'test post',
        body: 'test post',
        userId: 1,
        published: true,
        notifyMembers: true,
        publishAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
      }
    }
  })
  // create a self led challenge
  await createChallenge({
    name: 'Challenge #1',
    description: 'test challenge',
    type: 'SELF_LED',
    userId: 1,
    status: 'PUBLISHED',
    reminders: true,
    startAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    endAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    frequency: 'DAILY',
    public: true,
    posts: {
      createMany: {
        data: [
          {
            title: 'first day post',
            body: 'first day post',
            userId: 1,
            published: true,
            notifyMembers: true,
            publishOnDayNumber: 1
          },
          {
            title: 'second day post',
            body: 'second day post',
            userId: 1,
            published: true,
            notifyMembers: true,
            publishOnDayNumber: 2
          }
        ]
      }
    }
  })
  it('expects scheduled and day number posts to be sent', async ({ integration }) => {
    const response: Response = await loader({
      request: new Request('http://localhost/api/cron'),
      context: {},
      params: {}
    })

    const { scheduledPosts, dayNumberPosts } = response ? await response.json() : { scheduledPosts: undefined, dayNumberPosts: undefined }
    expect(scheduledPosts).toBeDefined()
    console.log('numScheduledPosts', scheduledPosts)
    expect(scheduledPosts).toEqual(0)
    expect(dayNumberPosts).toBeDefined()
    console.log('numDayNumberPosts', dayNumberPosts)
    expect(dayNumberPosts).toEqual(0)
  })
  it('expects only day number posts to be sent', async ({ integration }) => {
    // we use it to create a random user
    const response: Response = await loader({
      request: new Request('http://localhost/api/cron'),
      context: {},
      params: {}
    })

    const { scheduledPosts, dayNumberPosts } = response ? await response.json() : { scheduledPosts: undefined, dayNumberPosts: undefined }
    expect(scheduledPosts).toBeDefined()
    console.log('numScheduledPosts', scheduledPosts)
    expect(scheduledPosts).toEqual(0)
    expect(dayNumberPosts).toBeDefined()
    console.log('numDayNumberPosts', dayNumberPosts)
    expect(dayNumberPosts).toBeGreaterThan(0)
  })
})
