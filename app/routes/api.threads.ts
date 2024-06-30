import { createThread, updateThread, loadThreadSummary } from '~/models/thread.server'
import { requireCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction, type ActionFunction } from '@remix-run/node'
import { unstable_parseMultipartFormData } from '@remix-run/node'
import { uploadHandler, saveToCloudinary, deleteFromCloudinary } from '~/utils/uploadFile'
import { type CurrentUser } from '~/utils/types'
import { type Thread } from '@prisma/client'

interface ThreadData extends Thread {
  challenge?: { connect: { id: number } }
  user: { connect: { id: number } }
}
export const action: ActionFunction = async (args) => {
  const currentUser: CurrentUser | null = await requireCurrentUser(args)
  if (!currentUser) {
    return json({ message: 'You must be logged in to create a thread or thread' }, 401)
  }
  const request = args.request
  const rawData = await unstable_parseMultipartFormData(request, uploadHandler)
  const data: Partial<ThreadData> = {
    title: rawData.get('title') as string ?? '',
    body: rawData.get('body') as string ?? '',
    user: { connect: { id: currentUser.id } }
  }
  if (rawData.get('id')) {
    data.id = Number(rawData.get('id'))
  }
  if (rawData.get('challengeId')) {
    data.challenge = { connect: { id: Number(rawData.get('challengeId')) } }
  }
  let result
  if (data.id) {
    result = await updateThread(data)
  } else {
    result = await createThread(data)
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
  let shouldUpdate = false
  try {
    if (image ?? rawData.get('image') === 'delete') {
      shouldUpdate = true
      // delete existing file if it exists
      if (result.imageMeta?.public_id) {
        await deleteFromCloudinary(result.imageMeta.public_id, 'image')
      }
      if (image) {
        const imgNoExt = `thread-${result.id}-image`
        const imgMeta = await saveToCloudinary(image, imgNoExt)
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
      shouldUpdate = true
      // delete existing file if it exists
      if (result.videoMeta?.public_id) {
        await deleteFromCloudinary(result.videoMeta.public_id, 'video')
      }
      if (video) {
        const vidNoExt = `thread-${result.id}-video`
        const videoMeta = await saveToCloudinary(video, vidNoExt)
        result.video = videoMeta.secure_url
        result.videoMeta = videoMeta
      } else {
        result.videoMeta = null
      }
    }
  } catch (error) {
    console.error('error uploading video', error)
  }
  if (shouldUpdate) {
    await updateThread(result)
  }
  // send back a full thread that includes profile, user etc
  const newThread = await loadThreadSummary(result.id)
  return newThread
}

export const loader: LoaderFunction = async (args) => {
  return json({ message: 'This route does not accept GET requests' }, 200)
}
