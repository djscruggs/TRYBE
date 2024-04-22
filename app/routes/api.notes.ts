import { createNote, updateNote } from '~/models/note.server'
import { requireCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction, type ActionFunction } from '@remix-run/node'
import { unstable_parseMultipartFormData } from '@remix-run/node'
import { uploadHandler, writeFile } from '~/utils/uploadFile'

export const action: ActionFunction = async (args) => {
  const currentUser = await requireCurrentUser(args)

  const request = args.request
  const rawData = await unstable_parseMultipartFormData(request, uploadHandler)
  for (const [key, value] of rawData.entries()) {
    console.log(key, value)
  }
  const image = rawData.get('image')
  const data = {
    body: rawData.get('body'),
    user: { connect: { id: currentUser?.id } }
  }
  if (rawData.get('id')) {
    data.id = parseInt(rawData.get('id'))
  }
  if (rawData.get('challengeId')) {
    data.challenge = { connect: { id: parseInt(rawData.get('challengeId')) } }
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
  if (image) {
    const nameNoExt = `note-${result.id}`
    const webPath = await writeFile(image, nameNoExt)
    result.image = webPath
  } else {
    result.image = null
  }
  const updated = await updateNote(result)
  return json(updated)
}

export const loader: LoaderFunction = async (args) => {
  return json({ message: 'This route does not accept GET requests' }, 200)
}
