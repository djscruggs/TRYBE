import { createComment, updateComment, loadComment, deleteComment } from '~/models/comment.server'
import type { prisma } from '~/models/prisma.server'
import { requireCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction, type ActionFunction } from '@remix-run/node'
import { unstable_parseMultipartFormData } from '@remix-run/node'
import { uploadHandler, saveToCloudinary, deleteFromCloudinary } from '~/utils/uploadFile'
export const action: ActionFunction = async (args) => {
  const currentUser = await requireCurrentUser(args)
  const { request } = args
  const rawData = await unstable_parseMultipartFormData(request, uploadHandler)
  const formData = Object.fromEntries(rawData)
  // is this a delete request?
  const intent = formData.intent
  if (intent === 'delete') {
    const id = Number(formData.id)
    const result = await deleteComment(id)
    return json(result)
  }
  const data: prisma.commentCreateInput = {
    body: formData.body,
    user: { connect: { id: currentUser?.id } }
  }
  if (formData.id) {
    data.id = Number(formData.id)
  }
  // if this is a reply, the other relations will come from the parent
  const replyToId = formData.replyToId
  if (!replyToId) {
    if (formData.postId) {
      data.post = { connect: { id: Number(formData.postId) } }
    }
    if (formData.challengeId) {
      data.challenge = { connect: { id: Number(formData.challengeId) } }
    }
    if (formData.threadId) {
      data.thread = { connect: { id: Number(formData.threadId) } }
    }
    if (!data.challenge && !data.post && !data.thread) {
      return json({ message: 'Post id or callenge id is required' }, 400)
    }
  }
  if (replyToId) {
    data.replyTo = { connect: { id: Number(replyToId) } }
    // increment the thread depth, requires fetching the parent comment
    const parentComment = await loadComment(replyToId as number)
    const { postId, challengeId } = parentComment
    if (postId) {
      data.post = { connect: { id: postId } }
    }
    if (challengeId) {
      data.challenge = { connect: { id: challengeId } }
    }
    data.threadDepth = parentComment.threadDepth >= 5 ? 5 : parentComment.threadDepth + 1
  }
  const result = data.id ? await updateComment(data) : await createComment(data)
  // check if there is a video/image OR if it should be deleted
  let image, video
  if (rawData.get('image') === 'delete') {
    result.imageMeta = null
  } else if (rawData.get('image')) {
    image = rawData.get('image') as File
  }
  if (formData.video === 'delete') {
    result.videoMeta = null
  } else if (formData.video) {
    video = rawData.get('video') as File
  }
  try {
    if (image ?? rawData.get('image') === 'delete') {
      // delete existing file if it exists
      if (result.imageMeta?.public_id) {
        await deleteFromCloudinary(result.imageMeta.public_id as string, 'image')
        result.imageMeta = null
      }
      if (image) {
        const imgNoExt = `comment-${result.id}-image`
        const imgMeta = await saveToCloudinary(image, imgNoExt)
        result.imageMeta = imgMeta
      }
    }
  } catch (error) {
    console.error('error uploading image', error)
  }
  try {
    if (video ?? rawData.get('video') === 'delete') {
      // delete existing file if it exists
      if (result.videoMeta?.public_id) {
        await deleteFromCloudinary(result.videoMeta.public_id as string, 'video')
      }
      if (video) {
        const vidNoExt = `comment-${result.id}-video`
        const videoMeta = await saveToCloudinary(video, vidNoExt)
        result.videoMeta = videoMeta
      } else {
        result.videoMeta = null
      }
    }
  } catch (error) {
    console.error('error uploading video', error)
  }
  const updated = await updateComment(result)
  // refresh the comment to include user info attached
  const comment = await loadComment(updated.id as number, updated.userId as number)
  return json(comment)
}

export const loader: LoaderFunction = async (args) => {
  return json({ message: 'This route does not accept GET requests' }, 200)
}
