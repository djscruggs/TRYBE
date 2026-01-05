import type { ErrorObject, ObjectData } from '~/utils/types'

import { requireCurrentUser } from '~/models/auth.server'
import { deleteChallenge } from '~/models/challenge.server'
import { type LoaderFunction, type ActionFunctionArgs } from 'react-router'

export async function action(args: ActionFunctionArgs): Promise<Response> {
  const user = await requireCurrentUser(args)
  if (!user) {
    return Response.json({ error: 'User not authenticated' }, { status: 401 })
  }
  const { params } = args
  await deleteChallenge(Number(params.id), Number(user.id))
  return Response.json({ message: `Deleted challenge ${params.id}` })
}

export const loader: LoaderFunction = async (args) => {
  return Response.json(
    { message: 'This route does not accept GET requests' },
    { status: 405 }
  )
}
