import { deletePost } from '~/models/post.server'
import { requireCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction, type ActionFunctionArgs } from '@remix-run/node'

export async function action (args: ActionFunctionArgs): Promise<typeof action> {
  const { params } = args
  const user = await requireCurrentUser(args)
  try {
    await deletePost(Number(params?.id), Number(user.id))
    return json({ message: `Deleted post ${params?.id}` }, 204)
  } catch (error) {
    return json({ message: `Error deleting post ${params?.id}` }, 500)
  }
}

export const loader: LoaderFunction = async (args) => {
  return json({ message: 'This route does not accept GET requests' }, 200)
}
