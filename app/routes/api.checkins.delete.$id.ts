import { deleteCheckIn } from '~/models/challenge.server'
import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction, type ActionFunctionArgs } from 'react-router'

export async function action(args: ActionFunctionArgs): Promise<Response> {
  const { params } = args
  await requireCurrentUser(args)
  try {
    await deleteCheckIn(Number(params?.id))
    return Response.json({ message: `Deleted checkin ${params?.id}` })
  } catch (error) {
    return Response.json(
      { message: `Error deleting checkin ${params?.id}` },
      { status: 500 }
    )
  }
}

export const loader: LoaderFunction = async (args) => {
  return Response.json(
    { message: 'This route does not accept GET requests' },
    { status: 405 }
  )
}
