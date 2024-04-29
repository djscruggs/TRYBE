import { createNote, updateNote, loadNoteSummary } from '~/models/note.server'
import { requireCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction, type ActionFunction } from '@remix-run/node'
import { unstable_parseMultipartFormData } from '@remix-run/node'
import { uploadHandler, writeFile } from '~/utils/uploadFile'
import { type CurrentUser } from '~/utils/types'
import { type Note, type Challenge, type Post, type Comment, type User } from '@prisma/client'

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
  const data: NoteData = {
    body: rawData.get('body') as string ?? null,
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

  if (image) {
    const imgNoExt = `note-${result.id}-image`
    const imgPath = await writeFile(image, imgNoExt)
    result.image = imgPath
  }
  if (video) {
    const vidNoExt = `note-${result.id}-video`
    const vidPath = await writeFile(video, vidNoExt)
    result.video = vidPath
  }
  // send back a full note that includes profile, user etc
  const newNote = await loadNoteSummary(result.id)
  return json(newNote)
}

export const loader: LoaderFunction = async (args) => {
  return json({ message: 'This route does not accept GET requests' }, 200)
}
