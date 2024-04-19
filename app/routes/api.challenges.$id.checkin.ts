import { prisma } from '../models/prisma.server'
import { requireCurrentUser } from '~/models/auth.server'
import { loadUser } from '~/models/user.server'
import { loadChallenge, calculateNextCheckin } from '~/models/challenge.server'
import { json, type LoaderFunction } from '@remix-run/node'
import type { ActionFunctionArgs } from '@remix-run/node' // or cloudflare/deno

export async function action (args: ActionFunctionArgs): Promise<prisma.challenge> {
  const currentUser = await requireCurrentUser(args)
  if (!currentUser) {
    return {
      result: 'not-logged-in'
    }
  }

  const { params } = args
  const challenge = await loadChallenge(parseInt(params.id))
  if (!challenge) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw new Response(null, {
      status: 404,
      statusText: 'Challenge not found'
    })
  }
  // allow user who created the challenge to check in even if not a member
  const user = await loadUser(currentUser.id)
  const canCheckIn = user.memberChallenges.filter((c) => c.challengeId === parseInt(challenge?.id)).length > 0
  if (canCheckIn) {
    const result = await prisma.checkIn.create({
      data: {
        userId: parseInt(currentUser.id),
        challengeId: parseInt(params.id)
      }
    })
    // update last check in on subscription
    const dateUpdate = await prisma.memberChallenge.update({
      where: {
        challengeId_userId: {
          userId: currentUser.id,
          challengeId: parseInt(params.id)
        }
      },
      data: {
        lastCheckIn: new Date(),
        nextCheckIn: calculateNextCheckin(challenge)
      }
    })
    console.log('dateUpdate', dateUpdate)
    return {
      message: 'Check-in successful',
      data: result
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw new Response(null, {
      status: 403,
      statusText: 'User is not a member of this challenge'
    })
  }
}
export const loader: LoaderFunction = async (args) => {
  void requireCurrentUser(args)
  return json({ message: 'This route does not accept GET requests' }, 200)
}
