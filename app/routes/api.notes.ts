import { createNote, updateNote } from '~/models/note.server'
import { requireCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction, type ActionFunction } from '@remix-run/node'
import { unstable_parseMultipartFormData } from '@remix-run/node'
import { uploadHandler, writeFile } from '~/utils/uploadFile'
import { type Note } from '@prisma/client'

export const action: ActionFunction = async (args) => {
  const currentUser = await requireCurrentUser(args)

  const request = args.request
  const rawData = await unstable_parseMultipartFormData(request, uploadHandler)
  for (const [key, value] of rawData.entries()) {
    console.log(key, value)
  }
  const data: Note = {
    body: rawData.get('body') as string ?? null,
    user: { connect: { id: currentUser?.id } }
  }
  if (rawData.get('id')) {
    data.id = parseInt(rawData.get('id'))
  }
  if (rawData.get('challengeId')) {
    data.challenge = { connect: { id: parseInt(rawData.get('challengeId')) } }
  }
  if (rawData.get('postId')) {
    data.post = { connect: { id: parseInt(rawData.get('postId')) } }
  }
  if (rawData.get('commentId')) {
    data.comment = { connect: { id: parseInt(rawData.get('commentId')) } }
  }
  if (rawData.get('replyToId')) {
    console.log('setting reply to id')
    data.replyTo = { connect: { id: parseInt(rawData.get('replyToId')) } }
  }
  let result
  if (data.id) {
    result = await updateNote(data)
  } else {
    result = await createNote(data)
  }
  console.log('raw video is', rawData.get('video'))
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
  console.log('data.video is ', result.video)
  console.log('video is', video)

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
  const updated = await updateNote(result)
  return json(updated)
}

export const loader: LoaderFunction = async (args) => {
  return json({ message: 'This route does not accept GET requests' }, 200)
}
