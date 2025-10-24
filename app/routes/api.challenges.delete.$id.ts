import type { ErrorObject, ObjectData } from '~/utils/types'

import { requireCurrentUser } from '~/models/auth.server'
import { deleteChallenge } from '~/models/challenge.server'
import { type LoaderFunction, type ActionFunctionArgs  } from 'react-router';

export async function action (args: ActionFunctionArgs): Promise<Response> {
  const user = await requireCurrentUser(args)
  const { params } = args
  await deleteChallenge(Number(params.id), Number(user.id))
  return { message: `Deleted challenge ${params.id}` }
}

export const loader: LoaderFunction = async (args) => {
  return { message: 'This route does not accept GET requests' }
}
