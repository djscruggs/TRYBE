import { prisma } from './prisma.server'
import { type GroupedLikes } from '~/utils/types'

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

interface LikesByTypeParams {
  userId: number
}
export async function likesByType (params: LikesByTypeParams): Promise<GroupedLikes> {
  const { userId } = params

  const likes = await prisma.like.findMany({
    where: {
      userId
    },
    select: {
      postId: true,
      commentId: true,
      threadId: true,
      challengeId: true,
      checkinId: true
    }
  })

  const groupedLikes: GroupedLikes = {
    post: [],
    comment: [],
    thread: [],
    challenge: [],
    checkin: []
  }
  likes.forEach(like => {
    if (like.postId) groupedLikes.post.push(like.postId)
    if (like.commentId) groupedLikes.comment.push(like.commentId)
    if (like.threadId) groupedLikes.thread.push(like.threadId)
    if (like.challengeId) groupedLikes.challenge.push(like.challengeId)
    if (like.checkinId) groupedLikes.checkin.push(like.checkinId)
  })

  return groupedLikes
}
