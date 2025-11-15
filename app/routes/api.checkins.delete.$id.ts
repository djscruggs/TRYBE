import { deleteCheckIn } from '~/models/challenge.server'
import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction, type ActionFunctionArgs } from 'react-router'

export async function action(args: ActionFunctionArgs): Promise<Response> {
  const { params } = args
  await requireCurrentUser(args)
  try {
    await deleteCheckIn(Number(params?.id))
    return { message: `Deleted checkin ${params?.id}` }
  } catch (error) {
    return { message: `Error deleting checkin ${params?.id}` }
  }
}

export const loader: LoaderFunction = async (args) => {
  return { message: 'This route does not accept GET requests' }
}
