import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction  } from 'react-router';
import { prisma } from '~/models/prisma.server'

export const loader: LoaderFunction = async (args) => {
  const user = await requireCurrentUser(args)
  const { type, id } = args.params
  const whereClause = (() => {
    switch (type) {
      case 'post':
        return { postId: Number(id) }
      case 'comment':
        return { replyToId: Number(id) }
      case 'challenge':
        return { challengeId: Number(id) }
      case 'checkin':
        return { checkInId: Number(id) }
      case 'thread':
        return { threadId: Number(id) }
      default:
        throw new Error(`Unknown type: ${type}`)
    }
  })()

  const comments = await prisma.comment.findMany({
    where: {
      ...whereClause
    },
    select: {
      id: true,
      likes: {
        select: {
          id: true
        },
        where: {
          userId: user?.id
        }
      }
    }
  })
  // return just the ids of the comments that have been liked
  const likedCommentIds = comments
    .filter(comment => comment.likes.length > 0)
    .map(comment => comment.id)
  return Response.json(likedCommentIds)
}
