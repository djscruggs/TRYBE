import type { ErrorObject, ObjectData } from '~/utils/types.server'

import { requireCurrentUser } from '~/models/auth.server'
import { deleteChallenge } from '~/models/challenge.server'
import { json, type LoaderFunction } from '@remix-run/node'
import type { ActionFunctionArgs } from '@remix-run/node' // or cloudflare/deno

export async function action ({
  request, params
}: ActionFunctionArgs) {
  console.log('top of action')
  console.log('params', params)
  const result = await deleteChallenge(params.id)
  console.log('result', result)

  return json({ message: `Deleted challenge ${params.id}` }, 204)
}
export const loader: LoaderFunction = async ({ request }) => {
  const currentUser = await requireCurrentUser(request)
  return json({ message: 'This route does not accept GET requests' }, 200)
}
