// Your test cases here
import { createChallenge } from '~/models/challenge.server'
import type { Challenge } from '~/utils/types'
import { loader } from '~/routes/api.cron'

describe('testing api/cron', async () => {
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
  it('expects scheduled posts to be sent', async ({ integration }) => {
    // we use it to create a random user
    const response: Response = await loader({
      request: new Request('http://localhost'),
      context: {},
      params: {}
    })

    const { scheduledPosts, dayNumberPosts } = response ? await response.json() : { scheduledPosts: undefined, dayNumberPosts: undefined }
    console.log(scheduledPosts, dayNumberPosts)
    expect(scheduledPosts).toBeDefined()
    expect(scheduledPosts.length).toBeGreaterThan(0)
    expect(dayNumberPosts).toBeDefined()
    expect(dayNumberPosts.length).toBeGreaterThan(0)
  })
})
