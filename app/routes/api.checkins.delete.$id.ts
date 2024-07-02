import { deleteCheckIn } from '~/models/challenge.server'
import { requireCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction, type ActionFunctionArgs } from '@remix-run/node'

export async function action (args: ActionFunctionArgs) {
  const { params } = args
  await requireCurrentUser(args)
  try {
    await deleteCheckIn(Number(params?.id))
    return json({ message: `Deleted checkin ${params?.id}` }, 204)
  } catch (error) {
    return json({ message: `Error deleting checkin ${params?.id}` }, 500)
  }
}

export const loader: LoaderFunction = async (args) => {
  return json({ message: 'This route does not accept GET requests' }, 200)
}
