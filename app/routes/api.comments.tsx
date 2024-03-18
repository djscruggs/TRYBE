import { createComment } from '~/models/comment.server'
import { requireCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction, type ActionFunction } from '@remix-run/node'

export const action: ActionFunction = async (args) => {
  const currentUser = await requireCurrentUser(args)
  const formData = await args.request.formData()
  const data = {
    body: formData.get('body'),
    user: { connect: { id: currentUser?.id } },
    challenge: { connect: { id: parseInt(formData.get('challengeId')) } }
  }
  const result = await createComment(data)
  return json(result)
}

export const loader: LoaderFunction = async (args) => {
  return json({ message: 'This route does not accept GET requests' }, 200)
}
