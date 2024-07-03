import { prisma } from '~/models/prisma.server'
import { requireCurrentUser } from '~/models/auth.server'
import { loadUser } from '~/models/user.server'
import { joinChallenge, loadChallenge, calculateNextCheckin, updateCheckin } from '~/models/challenge.server'
import { json, type LoaderFunction, type ActionFunctionArgs } from '@remix-run/node'
import type { MemberChallenge } from '@prisma/client'
import { unstable_parseMultipartFormData } from '@remix-run/node'
import { uploadHandler, handleFormUpload } from '~/utils/uploadFile'

export async function action (args: ActionFunctionArgs): Promise<prisma.checkIn> {
  const currentUser = await requireCurrentUser(args)
  if (!currentUser) {
    return {
      result: 'not-logged-in'
    }
  }
  const request = args.request
  const rawData = await unstable_parseMultipartFormData(request, uploadHandler)

  const { params } = args
  const challenge = await loadChallenge(Number(params.id))
  if (!challenge) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw new Response(null, {
      status: 404,
      statusText: 'Challenge not found'
    })
  }
  // allow user who created the challenge to check in even if not a member
  const body = rawData.get('body') as string ?? ''
  let membership = await prisma.memberChallenge.findFirst({
    where: {
      userId: Number(currentUser.id),
      challengeId: Number(params.id)
    },
    include: {
      _count: {
        select: { checkIns: true }
      }
    }
  })
  let canCheckIn = !!membership
  if (challenge.userId === currentUser.id) {
    // if it's the creator of the challenge, create a membership on the fly
    membership = await joinChallenge(currentUser.id, Number(challenge.id))
    canCheckIn = true
  }
  if (canCheckIn) {
    let result
    if (rawData.get('checkinId')) {
      result = await prisma.checkIn.update({
        where: {
          id: Number(rawData.get('checkinId'))
        },
        data: {
          body
        }
      })
    } else {
      result = await prisma.checkIn.create({
        data: {
          userId: Number(currentUser.id),
          challengeId: Number(params.id),
          body,
          memberChallengeId: membership?.id
        }
      })
    }
    // update last check in on subscription
    await prisma.memberChallenge.update({
      where: {
        id: membership?.id ?? 0
      },
      data: {
        lastCheckIn: new Date(),
        nextCheckIn: calculateNextCheckin(challenge)
      }
    })
    await handleFormUpload({ formData: rawData, dataObj: result, nameSpace: 'checkin', onUpdate: updateCheckin })
    // reload membership
    const reloaded = await prisma.memberChallenge.findFirst({
      where: {
        userId: Number(currentUser.id),
        challengeId: Number(params.id)
      },
      include: {
        _count: {
          select: { checkIns: true }
        }
      }
    })
    return { checkIn: result, memberChallenge: reloaded }
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
