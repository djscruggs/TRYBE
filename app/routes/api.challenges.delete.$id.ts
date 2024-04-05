import type { ErrorObject, ObjectData } from '~/utils/types.server'

import { requireCurrentUser } from '~/models/auth.server'
import { deleteChallenge } from '~/models/challenge.server'
import { json, type LoaderFunction, type ActionFunctionArgs } from '@remix-run/node'

export async function action ({ params, request }: ActionFunctionArgs): Promise<Response> {
  const user = await requireCurrentUser(request)
  await deleteChallenge(Number(params.id), Number(user.id))
  return json({ message: `Deleted challenge ${params.id}` }, 204)
}

export const loader: LoaderFunction = async (args) => {
  return json({ message: 'This route does not accept GET requests' }, 200)
}
