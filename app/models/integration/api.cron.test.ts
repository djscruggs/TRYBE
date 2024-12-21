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
  // create a self led challenge and mambership set to get a reminder in the next 2 minutes
  const currentTimeGMT = new Date()
  const currentHourGMT = currentTimeGMT.getUTCHours()
  const currentMinuteGMT = currentTimeGMT.getUTCMinutes()
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
    members: {
      create: {
        userId: 2,
        notificationHour: currentMinuteGMT + 2 >= 60 ? (currentHourGMT + 1) % 24 : currentHourGMT,
        notificationMinute: currentMinuteGMT + 2 >= 60 ? (currentMinuteGMT + 2 - 60) : currentMinuteGMT + 2,
        dayNumber: 1
      }
    },
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
    // first run should send the scheduled post and the first day number post
    const response: Response = await loader({
      request: new Request('http://localhost/api/cron'),
      context: {},
      params: {}
    })

    const { scheduledPosts, dayNumberPosts, dayNotifications } = response ? await response.json() : { scheduledPosts: undefined, dayNumberPosts: undefined, dayNotifications: undefined }
    expect(scheduledPosts).toEqual(1)
    expect(dayNumberPosts).toBeDefined()
    expect(dayNumberPosts).toEqual(1)
    expect(dayNotifications).toEqual(0)
  })
  it('expects only day number posts to be sent', async ({ integration }) => {
    // now that we've sent the only scheduled post, the second day should just have a day number post
    const response: Response = await loader({
      request: new Request('http://localhost/api/cron'),
      context: {},
      params: {}
    })

    const { scheduledPosts, dayNumberPosts, dayNotifications } = response ? await response.json() : { scheduledPosts: undefined, dayNumberPosts: undefined, dayNotifications: undefined }
    expect(scheduledPosts).toEqual(0)
    expect(dayNumberPosts).toEqual(1)
    expect(dayNotifications).toEqual(0)
  })
  it('expects only day notifications to be sent', async ({ integration }) => {
    // now that we've sent the first two days of posts, the third day should just have a notification (because we only created 2 posts)
    const response: Response = await loader({
      request: new Request('http://localhost/api/cron'),
      context: {},
      params: {}
    })

    const { scheduledPosts, dayNumberPosts, dayNotifications } = response ? await response.json() : { scheduledPosts: undefined, dayNumberPosts: undefined, dayNotifications: undefined }
    expect(scheduledPosts).toEqual(0)
    expect(dayNumberPosts).toEqual(0)
    expect(dayNotifications).toEqual(1)
  })
})
