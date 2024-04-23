import { createComment, updateComment, loadComment, deleteComment } from '~/models/comment.server'
import { type prisma } from './prisma.server'
import { requireCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction, type ActionFunction } from '@remix-run/node'

export const action: ActionFunction = async (args) => {
  const currentUser = await requireCurrentUser(args)
  const formData = await args.request.formData()
  // is this a delete request?
  const intent = formData.get('intent')
  console.log('intent', intent)
  if (intent === 'delete') {
    const id = Number(formData.get('id'))
    const result = await deleteComment(id)
    return json(result)
  }

  const data: prisma.commentCreateInput = {
    body: formData.get('body'),
    user: { connect: { id: currentUser?.id } }
  }
  console.log('postId', formData.get('postId'))
  console.log('challengeId', formData.get('challengeId'))

  if (formData.get('postId')) {
    data.post = { connect: { id: Number(formData.get('postId')) } }
  }
  if (formData.get('challengeId')) {
    data.challenge = { connect: { id: Number(formData.get('challengeId')) } }
  }
  if (!data.challenge && !data.post) {
    return json({ message: 'Post id or callenge id is required' }, 400)
  }
  if (formData.get('id')) {
    data.id = Number(formData.get('id'))
  }
  console.log('data', data)
  const result = data.id ? await updateComment(data) : await createComment(data)
  console.log(result)
  // refresh the comment to include user info attached
  const comment = await loadComment(result.id as number, result.userId as number)
  return json(comment)
}

export const loader: LoaderFunction = async (args) => {
  return json({ message: 'This route does not accept GET requests' }, 200)
}
