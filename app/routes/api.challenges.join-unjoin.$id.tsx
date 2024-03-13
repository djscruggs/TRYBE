import { joinChallenge, unjoinChallenge, challengeSchema } from '~/models/challenge.server'
import { requireCurrentUser, getUser } from '~/models/auth.server'
import { json, type LoaderFunction } from '@remix-run/node'
import type { ActionFunctionArgs } from '@remix-run/node' // or cloudflare/deno

export async function action ({
  request, params
}: ActionFunctionArgs): Promise<prisma.challenge> {
  void requireCurrentUser(request)
  const user = await getUser(request, true)
  if (!user) {
    return {
      result: 'not-logged-in'
    }
  }
  if (user.memberChallenges.filter((c) => c.challengeId === parseInt(params.id!)).length > 0) {
    const result = await unjoinChallenge(user.id, Number(params.id))
    return {
      result: 'unjoined',
      data: result
    }
  } else {
    const result = await joinChallenge(user.id, Number(params.id))
    return {
      result: 'joined',
      data: result
    }
  }
}
export const loader: LoaderFunction = async ({ request }) => {
  void requireCurrentUser(request)
  return json({ message: 'This route does not accept GET requests' }, 200)
}
