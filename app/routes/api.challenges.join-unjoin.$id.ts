import { joinChallenge, unjoinChallenge, challengeSchema } from '~/models/challenge.server'
import { requireCurrentUser } from '~/models/auth.server'
import { loadUser } from '~/models/user.server'
import { json, type LoaderFunction } from '@remix-run/node'
import type { ActionFunctionArgs } from '@remix-run/node' // or cloudflare/deno
import type { MemberChallenge } from '@prisma/client'

export async function action (args: ActionFunctionArgs): Promise<prisma.challenge> {
  const currentUser = await requireCurrentUser(args)
  if (!currentUser) {
    return {
      result: 'not-logged-in'
    }
  }
  const { params } = args
  const user = await loadUser(currentUser.id)
  const memberChallenge = user.memberChallenges.find((c: MemberChallenge) => c.challengeId === Number(params.id))
  if (memberChallenge) {
    const result = await unjoinChallenge(memberChallenge.id as number)
    return {
      result: 'unjoined',
      data: result
    }
  } else {
    const result = await joinChallenge(Number(user.id), Number(params.id))
    console.log('joined', result)
    return {
      result: 'joined',
      data: result
    }
  }
}
export const loader: LoaderFunction = async (args) => {
  void requireCurrentUser(args)
  return json({ message: 'This route does not accept GET requests' }, 200)
}
