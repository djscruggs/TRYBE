import { createNote } from '~/models/note.server'
import { requireCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction, type ActionFunction } from '@remix-run/node'

export const action: ActionFunction = async (args) => {
  const currentUser = await requireCurrentUser(args)
  const formData = await args.request.formData()
  console.log(formData)
  const data = {
    body: formData.get('body'),
    user: { connect: { id: currentUser?.id } }
  }
  if (formData.get('challengeId')) {
    data.challenge = { connect: { id: parseInt(formData.get('challengeId')) } }
  }
  if (formData.get('commentId')) {
    data.comment = { connect: { id: parseInt(formData.get('commentId')) } }
  }
  if (formData.get('replyToId')) {
    data.replyTo = { connect: { id: parseInt(formData.get('replyToId')) } }
  }
  console.log('data', data)
  const result = await createNote(data)
  console.log('returning', result)
  return json(result)
}

export const loader: LoaderFunction = async (args) => {
  return json({ message: 'This route does not accept GET requests' }, 200)
}
