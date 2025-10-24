import { prisma } from '~/models/prisma.server'
import { requireCurrentUser } from '~/models/auth.server'
import { joinChallenge, loadChallenge, calculateNextCheckin, updateCheckin } from '~/models/challenge.server'
import { type LoaderFunction, type ActionFunctionArgs  } from 'react-router';
// import { unstable_parseMultipartFormData } from 'react-router'; // Not available in React Router v7
import { uploadHandler, handleFormUpload } from '~/utils/uploadFile'

export async function action (args: ActionFunctionArgs): Promise<prisma.checkIn> {
  const currentUser = await requireCurrentUser(args)
  if (!currentUser) {
    return {
      result: 'not-logged-in'
    }
  }
  const request = args.request
  // const rawData = await unstable_parseMultipartFormData(request, uploadHandler) // Not available in React Router v7

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
  if (challenge.userId === currentUser.id && !membership) {
    // if it's the creator of the challenge, create a membership on the fly
    membership = await joinChallenge({ userId: currentUser.id, challengeId: Number(challenge.id) })
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
    await handleFormUpload({ formData: rawData, dataObj: result, nameSpace: 'checkin', onUpdate: updateCheckin })
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
    return { checkIn: reloadedCheckin, memberChallenge: reloadedMemberChallenge }
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
  return Response.json({ message: 'This route does not accept GET requests' }, 200)
}
