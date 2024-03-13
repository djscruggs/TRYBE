import { createComment } from '~/models/comment.server'
import { requireCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction, type ActionFunction } from '@remix-run/node'

export const action: ActionFunction = async ({ request }) => {
  const currentUser = await requireCurrentUser(request)
  const formData = await request.formData()
  const data = {
    body: formData.get('body'),
    user: { connect: { id: currentUser?.id } },
    challenge: { connect: { id: parseInt(formData.get('challengeId')) } }
  }
  const result = await createComment(data)
  return json(result)
}

export const loader: LoaderFunction = async ({ request }) => {
  void requireCurrentUser(request)
  return json({ message: 'This route does not accept GET requests' }, 200)
}
