import { createPost, updatePost, loadPostSummary } from '~/models/post.server'
import type { Post, Challenge } from '@prisma/client'
import { type CurrentUser } from '~/utils/types'
import { loadChallenge } from '~/models/challenge.server'
import { requireCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction, type ActionFunction } from '@remix-run/node'
import { unstable_parseMultipartFormData } from '@remix-run/node'
import { uploadHandler, saveToCloudinary, deleteFromCloudinary } from '~/utils/uploadFile'
import { mailPost } from '~/utils/mailer'
import getUserLocale from 'get-user-locale'
import { format, isPast, isEqual } from 'date-fns'
import { textToHtml } from '~/utils/helpers'
import escape from 'escape-html'

export const action: ActionFunction = async (args) => {
  const currentUser = (await requireCurrentUser(args))!
  const request = args.request
  const rawData = await unstable_parseMultipartFormData(request, uploadHandler)
  // if this is for a challenge, load it and check whether it's public
  const challengeId = rawData.get('challengeId') ? Number(rawData.get('challengeId')) : null
  let challenge
  if (challengeId) {
    challenge = await loadChallenge(challengeId) as Challenge
  }
  const data: Partial<Post> = {
    body: rawData.get('body')?.toString() ?? null,
    title: rawData.get('title')?.toString() ?? '',
    userId: currentUser.id,
    public: rawData.get('public') === 'true',
    published: rawData.get('published') === 'true'
  }
  // if draft or unpublishing, published will be false, so reset notificationSentOn to null
  if (!data.published) {
    data.notificationSentOn = null
  }
  if (challenge) {
    data.challengeId = challenge.id
    data.public = Boolean(challenge.public)
  }
  // save what we have so far
  let result
  if (rawData.get('id')) {
    data.id = Number(rawData.get('id'))
    result = await updatePost(data)
  } else {
    result = await createPost(data as Post)
  }
  // check if there is a video/image OR if it should be deleted
  let image, video
  if (rawData.get('image') === 'delete') {
    result.image = null
  } else if (rawData.get('image')) {
    image = rawData.get('image') as File
  }
  if (rawData.get('video') === 'delete') {
    result.video = null
  } else if (rawData.get('video')) {
    video = rawData.get('video') as File
  }
  try {
    if (image ?? rawData.get('image') === 'delete') {
      // delete existing file if it exists
      if (result.imageMeta?.public_id) {
        await deleteFromCloudinary(result.imageMeta.public_id)
      }
      if (image) {
        // const imgNoExt = `note-${result.id}-image`
        const imgMeta = await saveToCloudinary(image)
        result.image = imgMeta.secure_url
        result.imageMeta = imgMeta
      } else {
        result.imageMeta = null
      }
    }
  } catch (error) {
    console.error('error uploading image', error)
  }
  try {
    if (video ?? rawData.get('video') === 'delete') {
      // delete existing file if it exists
      if (result.videoMeta?.public_id) {
        await deleteFromCloudinary(result.videoMeta.public_id)
      }
      if (video) {
        // const vidNoExt = `note-${result.id}-video`
        const videoMeta = await saveToCloudinary(video)
        result.video = videoMeta.secure_url
        result.videoMeta = videoMeta
      } else {
        result.videoMeta = null
      }
    }
  } catch (error) {
    console.error('error uploading video', error)
  }
  const updated = await updatePost(result)

  // @ts-expect-error live is a computed field and not recognized in prisma Post type -- see prisma.server
  if (updated.live) {
    const baseUrl = new URL(args.request.url).origin
    // @ts-expect-error fullName is a computed field and not recognized in prisma Profile type -- see prisma.server
    const senderName = currentUser.profile.fullName
    const dateFormat = getUserLocale() === 'en-US' ? 'MMMM d' : 'd MMMM'
    // const escaped = updated.body?.replace(/['"&’]/g, match => `&#${match.charCodeAt(0)};`)
    const msg = {
      // to: process.env.NODE_ENV !== 'production' ? ['me.derekscruggs@gmail.com', currentUser.email] : ['me.derekscruggs@gmail.com', currentUser.email],
      to: currentUser.email,
      replyTo: currentUser.email,
      dynamic_template_data: {
        name: senderName,
        post_url: `${baseUrl}/posts/${updated.id}`,
        date: format(updated.updatedAt, dateFormat), // format based on user's country
        subject: `New challenge post from ${senderName} on Trybe`,
        title: updated.title,
        body: textToHtml(escape(updated.body))
      }
    }
    try {
      const mailed = await mailPost(msg)
      console.log('mailer result', mailed)
    } catch (error) {
      console.log('Error from SendGrid')
      console.log(error.response.body.errors)
    }
    updated.notificationSentOn = new Date()
    await updatePost(updated)
  }
  // send back the full post with counts, user etc
  const finalPost = await loadPostSummary(updated.id)
  return json(finalPost)
}

export const loader: LoaderFunction = async (args) => {
  return json({ message: 'This route does not accept GET requests' }, 200)
}
