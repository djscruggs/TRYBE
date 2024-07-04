import { prisma } from './prisma.server'

interface HasLikedParams {
  userId: number
  postId?: number
  commentId?: number
  threadId?: number
  challengeId?: number
  checkinId?: number
}
export async function userHasLiked (params: HasLikedParams): Promise<number> {
  const { userId, postId, commentId, threadId, challengeId, checkinId } = params
  const result = await prisma.like.aggregate({
    _count: { id: true },
    where: {
      userId,
      OR: [
        { challengeId: challengeId ? Number(challengeId) : undefined },
        { postId: postId ? Number(postId) : undefined },
        { threadId: threadId ? Number(threadId) : undefined },
        { checkinId: checkinId ? Number(checkinId) : undefined },
        { commentId: commentId ? Number(commentId) : undefined }
      ]
    }
  })
  return result._count.id
}
interface CommentsLikedByUserParams {
  commentIds: number[]
  userId: number
}
export async function commentsLikedByUser (params: CommentsLikedByUserParams): Promise<Array<Partial<prisma.Like>>> {
  const { commentIds } = params
  const totalCommentsLiked = await prisma.like.findMany({
    select: {
      commentId: true
    },
    where: {
      commentId: { in: commentIds },
      userId: params.userId
    }
  })
  return totalCommentsLiked
}
export async function fetchUserLikes (userId: number): Promise<prisma.Like[]> {
  const likes = await prisma.like.findMany({
    where: {
      userId
    }
  })
  return likes
}
export async function commentIdsLikedByUser (params: CommentsLikedByUserParams): Promise<number[]> {
  if (!params.commentIds.length || !params.userId) return []
  const likes = await commentsLikedByUser(params)
  return likes.map(like => like.commentId)
}
