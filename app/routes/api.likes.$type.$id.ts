import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction } from 'react-router'
import { prisma } from '~/models/prisma.server'

export const loader: LoaderFunction = async (args) => {
  const user = await requireCurrentUser(args)
  const { type, id } = args.params
  const whereClause = (() => {
    switch (type) {
      case 'post':
        return { postId: Number(id) }
      case 'comment':
        return { commentId: Number(id) }
      case 'challenge':
        return { challengeId: Number(id) }
      case 'checkin':
        return { checkinId: Number(id) }
      case 'thread':
        return { threadId: Number(id) }
      default:
        throw new Error(`Unknown type: ${type}`)
    }
  })()
  const likedIds = await prisma.like.findMany({
    where: {
      ...whereClause,
      userId: user?.id
    },
    select: {
      id: true
    }
  })
  return likedIds.map((like) => like.id)
}
