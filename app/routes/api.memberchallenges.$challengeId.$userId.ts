import { prisma } from '~/models/prisma.server'
import { type ActionFunction, json, type LoaderFunction } from '@remix-run/node'
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
  return json({ memberChallenge }, 200)
}
