import { prisma } from '~/models/prisma.server'
import { requireCurrentUser } from '~/models/auth.server'
import {
  joinChallenge,
  loadChallenge,
  calculateNextCheckin,
  updateCheckin
} from '~/models/challenge.server'
import { type LoaderFunction, type ActionFunctionArgs } from 'react-router'
import { parseFormData } from '@remix-run/form-data-parser'
import { handleFormUpload, memoryUploadHandler } from '~/utils/uploadFile'

export async function action(
  args: ActionFunctionArgs
): Promise<any> {
  const currentUser = await requireCurrentUser(args)
  if (!currentUser) {
    return Response.json({ error: 'Unauthorized', message: 'User not authenticated' }, { status: 401 })
  }
  const request = args.request

  const formData = await parseFormData(request, memoryUploadHandler)
  const rawData = formData

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
  const body = (rawData.get('body') as string) ?? ''
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
  if (challenge.userId === currentUser.id && !membership) {
    // if it's the creator of the challenge, create a membership on the fly
    membership = await joinChallenge({
      userId: currentUser.id,
      challengeId: Number(challenge.id)
    })
  }

  if (membership) {
    const cohortId = membership.cohortId
    let result
    if (rawData.get('checkinId')) {
      result = await prisma.checkIn.update({
        where: {
          id: Number(rawData.get('checkinId'))
        },
        data: {
          body,
          cohortId: cohortId ?? null
        }
      })
    } else {
      result = await prisma.checkIn.create({
        data: {
          userId: Number(currentUser.id),
          challengeId: Number(params.id),
          body,
          cohortId: cohortId ?? null,
          memberChallengeId: membership.id ?? null
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
    await handleFormUpload({
      formData: rawData,
      dataObj: result as any,
      nameSpace: 'checkin',
      onUpdate: updateCheckin as any
    })
    // reload membership and checkin
    const reloadedMemberChallenge = await prisma.memberChallenge.findFirst({
      where: {
        userId: Number(currentUser.id),
        challengeId: Number(params.id)
      },
      include: {
        user: {
          include: {
            profile: true
          }
        },
        _count: {
          select: { checkIns: true }
        }
      }
    })
    // reload the checkin with the user and memberChallenge
    const reloadedCheckin = await prisma.checkIn.findUnique({
      where: {
        id: result.id
      },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    })
    return Response.json({
      checkIn: reloadedCheckin,
      memberChallenge: reloadedMemberChallenge
    })
  } else {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw new Response(null, {
      status: 403,
      statusText: 'User is not a member of this challenge'
    })
  }
}
export const loader: LoaderFunction = async (args) => {
  await requireCurrentUser(args)
  return { message: 'This route does not accept GET requests' }
}
