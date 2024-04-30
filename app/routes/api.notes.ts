import { createNote, updateNote, loadNoteSummary } from '~/models/note.server'
import { requireCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction, type ActionFunction } from '@remix-run/node'
import { unstable_parseMultipartFormData } from '@remix-run/node'
import { uploadHandler, saveToCloudinary, deleteFromCloudinary } from '~/utils/uploadFile'
import { type CurrentUser } from '~/utils/types'
import { type Note } from '@prisma/client'

interface NoteData extends Note {
  challenge?: { connect: { id: number } }
  post?: { connect: { id: number } }
  comment?: { connect: { id: number } }
  user: { connect: { id: number } }
  replyTo?: { connect: { id: number } }
}
export const action: ActionFunction = async (args) => {
  const currentUser: CurrentUser | null = await requireCurrentUser(args)
  if (!currentUser) {
    return json({ message: 'You must be logged in to create a note or thread' }, 401)
  }
  const request = args.request
  const rawData = await unstable_parseMultipartFormData(request, uploadHandler)
  // for (const [key, value] of rawData.entries()) {
  //   console.log(key, value, typeof value)
  // }
  const data: Partial<NoteData> = {
    body: rawData.get('body') as string ?? '',
    user: { connect: { id: currentUser.id } }
  }
  if (rawData.get('id')) {
    data.id = Number(rawData.get('id'))
  }
  if (rawData.get('challengeId')) {
    data.challenge = { connect: { id: Number(rawData.get('challengeId')) } }
  }
  if (rawData.get('postId')) {
    data.post = { connect: { id: Number(rawData.get('postId')) } }
  }
  console.log('isThread is', rawData.get('isThread'))
  if (rawData.get('isThread')) {
    data.isThread = rawData.get('isThread') === 'true'
  }
  if (rawData.get('commentId')) {
    data.comment = { connect: { id: Number(rawData.get('commentId')) } }
  }
  if (rawData.get('replyToId')) {
    data.replyTo = { connect: { id: Number(rawData.get('replyToId')) } }
  }
  let result
  if (data.id) {
    result = await updateNote(data)
  } else {
    result = await createNote(data)
  }
  console.log('checking raw data')
  console.log(rawData.get('image'))
  console.log(rawData.get('video'))
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
        deleteFromCloudinary(result.imageMeta.public_id)
      }
      if (image) {
        const imgNoExt = `note-${result.id}-image`
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
        deleteFromCloudinary(result.videoMeta.public_id)
      }
      if (video) {
        const vidNoExt = `note-${result.id}-video`
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
    await updateNote(result)
  }
  // send back a full note that includes profile, user etc
  const newNote = await loadNoteSummary(result.id)
  return newNote
}

export const loader: LoaderFunction = async (args) => {
  return json({ message: 'This route does not accept GET requests' }, 200)
}
