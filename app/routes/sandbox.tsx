import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction } from '@remix-run/node'
import { prisma } from '~/models/prisma.server'
import { mailPost } from '~/utils/mailer'
import { format } from 'date-fns'
import { textToHtml, convertYouTubeLinksToImages, pathToEmailUrl } from '~/utils/helpers'
import { createCohort } from '~/models/challenge.server'
// const ogs = require('open-graph-scraper')
// const options = { url: 'http://ogp.me/' }
export const loader: LoaderFunction = async (args) => {
  await requireCurrentUser(args)
  const members = await prisma.memberChallenge.findMany({
    where: {
      cohortId: null,
      challenge: {
        type: 'SELF_LED'
      }
    }
  })
  const c =
    {
      createdAt: '2024-12-31T04:45:33.545Z',
      updatedAt: '2024-12-31T04:45:33.545Z',
      publishAt: '2024-12-31T04:45:33.544Z',
      name: '15 min. Stretching Routine Builder',
      userId: 11,
      color: 'purple',
      description: "Each day we progressively add 1 minute of stretching time, introducing a new segment. By the end, participants will have a balanced, repeatable 15-minute routine they can use when they wake up, before a workout or whenever they're feeling tight.",
      endAt: null,
      icon: 'People-11.png',
      reminders: false,
      startAt: null,
      syncCalendar: false,
      frequency: 'DAILY',
      mission: null,
      public: true,
      video: null,
      commentCount: 0,
      likeCount: 0,
      coverPhotoMeta: 'null',
      videoMeta: 'null',
      numDays: 15,
      type: 'SELF_LED',
      status: 'PUBLISHED'
    }
  const result = await prisma.challenge.create({ data: c })
  return {
    result
  }

  // const data = await ogs(options)
  // const { error, html, result } = data
  // console.log('error:', error) // This returns true or false. True if there was an error. The error itself is inside the result object.
  // console.log('html:', html) // This contains the HTML of page
  // console.log('result:', result) // This contains all of the Open Graph results

  const data = [
    {
      path: invitePath
    }
  ]

  return {
    data
  }
  // const result = await prisma.post.createMany({ data })
  const post = await prisma.post.findFirst({
    where: {
      id: 197
    }
  })
  try {
    const baseUrl = new URL(args.request.url).origin
    const dateFormat = 'MMMM d'
    const replyToName = 'DJ Scruggs'
    const msg = {
      to: 'info@jointhetrybe.com',
      replyTo: 'info@jointhetrybe.com',
      dynamic_template_data: {
        name: 'John Doe',
        post_url: `${baseUrl}/posts/${post?.id}`,
        date: post?.updatedAt ? format(post?.updatedAt, dateFormat) : '', // format based on user's country
        subject: `New challenge post from ${replyToName} on Trybe`,
        title: post?.title,
        body: textToHtml(convertYouTubeLinksToImages(post?.body ?? '', `${baseUrl}/posts/${post?.id}`))
      }
    }
    try {
      await mailPost(msg)
    } catch (error) {
      console.error('Error from SendGrid', error)
    }
  } catch (error) {
    console.error('Post mail error', error)
  }
  return {
    post
  }
}
