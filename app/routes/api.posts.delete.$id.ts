import { deletePost } from '~/models/post.server'
import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction, type ActionFunctionArgs  } from 'react-router';

export async function action (args: ActionFunctionArgs): Promise<typeof action> {
  const { params } = args
  const user = await requireCurrentUser(args)
  try {
    await deletePost(Number(params?.id), Number(user.id))
    return { message: `Deleted post ${params?.id}` }
  } catch (error) {
    return { message: `Error deleting post ${params?.id}` }
  }
}

export const loader: LoaderFunction = async (args) => {
  return { message: 'This route does not accept GET requests' }
}
