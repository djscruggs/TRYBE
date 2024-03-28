import { createNote, updateNote } from '~/models/note.server'
import { requireCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction, type ActionFunction } from '@remix-run/node'
import { unstable_parseMultipartFormData } from '@remix-run/node'
import { uploadHandler, writeFile } from '~/utils/uploadFile'

export const action: ActionFunction = async (args) => {
  const currentUser = await requireCurrentUser(args)

  const request = args.request
  const rawData = await unstable_parseMultipartFormData(request, uploadHandler)
  const image = rawData.get('image')
  console.log(rawData)
  const data = {
    body: rawData.get('body'),
    user: { connect: { id: currentUser?.id } }
  }
  if (rawData.get('challengeId')) {
    data.challenge = { connect: { id: parseInt(rawData.get('challengeId')) } }
  }
  if (rawData.get('commentId')) {
    data.comment = { connect: { id: parseInt(rawData.get('commentId')) } }
  }
  if (rawData.get('replyToId')) {
    data.replyTo = { connect: { id: parseInt(rawData.get('replyToId')) } }
  }
  console.log('data', data)
  const result = await createNote(data)
  if (image) {
    const nameNoExt = image.name.split('.')[0]
    const webPath = await writeFile(image, nameNoExt)
    result.image = webPath
  }
  const updated = await updateNote(result)
  console.log('returning', updated)
  return json(updated)
}

export const loader: LoaderFunction = async (args) => {
  return json({ message: 'This route does not accept GET requests' }, 200)
}
