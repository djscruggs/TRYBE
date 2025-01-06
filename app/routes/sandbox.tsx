import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction } from '@remix-run/node'
import { prisma } from '~/models/prisma.server'
import { mailPost } from '~/utils/mailer'
import { format } from 'date-fns'
import { textToHtml, convertYouTubeLinksToImages, pathToEmailUrl } from '~/utils/helpers'
import escape from 'escape-html'
import { AxiosError } from 'axios'
// const ogs = require('open-graph-scraper')
// const options = { url: 'http://ogp.me/' }
export const loader: LoaderFunction = async (args) => {
  const user = await requireCurrentUser(args)
  const invitePath = pathToEmailUrl('/challenges/v/41/chat/2?i=1&foo=bar')

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
