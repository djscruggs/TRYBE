import { prisma } from './prisma.server'

interface HasLikedParams {
  postId?: number
  commentId?: number
  threadId?: number
  challengeId?: number
}
export async function userHasLiked (params: HasLikedParams): Promise<number> {
  const { postId, commentId, threadId, challengeId } = params
  const result = await prisma.like.aggregate({
    _count: { id: true },
    where: {
      OR: [
        { challengeId: challengeId ? Number(challengeId) : undefined },
        { postId: postId ? Number(postId) : undefined },
        { threadId: threadId ? Number(threadId) : undefined },
        { commentId: commentId ? Number(commentId) : undefined }
      ]
    }
  })
  return result._count.id
}
interface CommentsLikedByUserParams {
  commentIds: number[]
}
export async function commentsLikedByUser (params: CommentsLikedByUserParams): Promise<Array<Partial<prisma.Like>>> {
  const { commentIds } = params
  const totalCommentsLiked = await prisma.like.findMany({
    select: {
      commentId: true
    },
    where: {
      commentId: { in: commentIds }
    }
  })
  return totalCommentsLiked
}
export async function commentIdsLikedByUser (params: CommentsLikedByUserParams): Promise<number[]> {
  const likes = await commentsLikedByUser(params)
  return likes.map(like => like.commentId)
}
