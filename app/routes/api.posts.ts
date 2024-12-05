import { createPost, updatePost, loadPostSummary } from '~/models/post.server'
import type { Post, Challenge } from '@prisma/client'
import { type CurrentUser } from '~/utils/types'
import { loadChallenge } from '~/models/challenge.server'
import { requireCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction, type ActionFunction } from '@remix-run/node'
import { unstable_parseMultipartFormData } from '@remix-run/node'
import { uploadHandler, handleFormUpload } from '~/utils/uploadFile'
import { mailPost } from '~/utils/mailer'
import getUserLocale from 'get-user-locale'
import { format, isPast, isEqual } from 'date-fns'
import { textToHtml, convertStringValues } from '~/utils/helpers'
import escape from 'escape-html'

export const action: ActionFunction = async (args) => {
  const currentUser = (await requireCurrentUser(args))!
  const request = args.request
  const rawData = await unstable_parseMultipartFormData(request, uploadHandler)
  const formData = Object.fromEntries(rawData)
  // remove title from formData because the convertStringValues function will screws up on values like "Day 1"
  const { title, body, ...formDataWithoutTitle } = formData
  const cleanData = convertStringValues(formDataWithoutTitle)

  cleanData.title = title
  cleanData.body = body
  // if this is for a challenge, load it and check whether it's public
  const challengeId = rawData.get('challengeId') ? Number(rawData.get('challengeId')) : null
  let challenge: Challenge | null = null
  if (challengeId) {
    challenge = await loadChallenge(challengeId) as Challenge | null
  }
  const data: Partial<Post> = {
    body: cleanData.body ?? null,
    title: cleanData.title ?? '',
    userId: currentUser.id,
    public: cleanData.public,
    publishAt: cleanData.publishAt ? cleanData.publishAt : null,
    published: cleanData.published,
    notifyMembers: cleanData.notifyMembers,
    publishOnDayNumber: cleanData.publishOnDayNumber
  }
  // if draft or unpublishing, published will be false, so reset notificationSentOn to null
  if (!data.published) {
    data.notificationSentOn = null
  }
  if (challenge) {
    data.challengeId = challenge.id
    data.public = Boolean(challenge.public)
    if (challenge.type === 'SELF_LED') {
      data.publishAt = null
      data.published = false // self-led challenges are never published
    }
  }
  // save what we have so far
  let result
  try {
    if (rawData.get('id')) {
      data.id = Number(rawData.get('id'))
      result = await updatePost(data)
    } else {
      result = await createPost(data as Post)
    }
  } catch (error) {
    console.error('error creating post', error)
  }
  // check if there is a video/image OR if it should be deleted
  await handleFormUpload({ formData: rawData, dataObj: result, nameSpace: 'post', onUpdate: updatePost })
  let updated = {}
  try {
    updated = await updatePost(result)
  } catch (error) {
    console.error('error updating post', error)
  }
  // @ts-expect-error live is a computed field and not recognized in prisma Post type -- see prisma.server
  if (updated.live && updated.notifyMembers) {
    const baseUrl = new URL(args.request.url).origin
    // @ts-expect-error fullName is a computed field and not recognized in prisma Profile type -- see prisma.server
    const replyToName = currentUser.profile.fullName
    const dateFormat = getUserLocale() === 'en-US' ? 'MMMM d' : 'd MMMM'
    // const escaped = updated.body?.replace(/['"&’]/g, match => `&#${match.charCodeAt(0)};`)
    try {
      const msg = {
        to: 'info@jointhetrybe.com',
        replyTo: currentUser.email,
        dynamic_template_data: {
          name: replyToName,
          post_url: `${baseUrl}/posts/${updated.id}`,
          date: format(updated.updatedAt, dateFormat), // format based on user's country
          subject: `New challenge post from ${replyToName} on Trybe`,
          title: updated.title,
          body: textToHtml(escape(updated.body))
        }
      }
      try {
        const mailed = await mailPost(msg)
      } catch (error) {
        console.error('Error from SendGrid', error)
      }
      updated.notificationSentOn = new Date()
      await updatePost(updated)
    } catch (error) {
      console.error('error preparing email', error)
    }
  }
  // send back the full post with counts, user etc
  const finalPost = await loadPostSummary(updated.id)
  return json(finalPost)
}

export const loader: LoaderFunction = async (args) => {
  return json({ message: 'This route does not accept GET requests' }, 200)
}
