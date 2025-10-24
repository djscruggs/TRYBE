import { prisma } from '~/models/prisma.server'
import { type ActionFunction, type LoaderFunction  } from 'react-router';
import { requireCurrentUser } from '~/models/auth.server'

export const loader: LoaderFunction = async (args) => {
  const { params } = args
  const { challengeId, userId } = params
  const memberChallenge = await prisma.memberChallenge.findFirst({
    where: { AND: [{ challengeId: Number(challengeId) }, { userId: Number(userId) }] },
    include: {
      challenge: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  return Response.json({ memberChallenge }, 200)
}
