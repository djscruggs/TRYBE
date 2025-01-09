import { prisma } from './prisma.server'
import { deleteFromCloudinary } from '~/utils/uploadFile'
function generateIncludeObject (levels: number): any {
  if (levels <= 0) {
    return true
  }
  return {
    user: {
      include: {
        profile: true
      }
    },
    replies: { include: generateIncludeObject(levels - 1) }
  }
}

export const fetchChallengeCheckinComments = async (challengeId: number): Promise<prisma.comment[]> => {
  // first get checkins for challenge
  const checkIns = await prisma.checkIn.findMany({
    select: { id: true },
    where: { challengeId }
  })
  const checkInIds = checkIns.map(checkIn => checkIn.id)
  const includes = generateIncludeObject(5)
  const comments = await prisma.comment.findMany({
    where: { checkInId: { in: checkInIds } },
    orderBy: {
      createdAt: 'desc'
    },
    include: includes
  })
  // Reformat comments as a hash keyed off checkInId
  const commentsByCheckInId: Record<number, prisma.comment[]> = {}
  comments.forEach(comment => {
    const checkInId = comment.checkInId!
    if (!commentsByCheckInId[checkInId]) {
      commentsByCheckInId[checkInId] = []
    }
    commentsByCheckInId[checkInId].push(comment)
  })

  return commentsByCheckInId
}
interface FetchCommentsParams {
  challengeId?: number
  postId?: number
  threadId?: number
  checkInId?: number
  replyToId?: number
}

export const fetchComments = async (params: FetchCommentsParams): Promise<prisma.comment[]> => {
  const { challengeId, postId, threadId, checkInId, replyToId } = params
  if (!challengeId && !postId && !threadId && !checkInId && !replyToId) {
    throw new Error('challengeId or postId or threadId or checkInId or replyToId must be provided')
  }
  const orClause = {
    challengeId: challengeId ? Number(challengeId) : undefined,
    postId: postId ? Number(postId) : undefined,
    threadId: threadId ? Number(threadId) : undefined,
    checkInId: checkInId ? Number(checkInId) : undefined,
    replyToId: replyToId ? Number(replyToId) : undefined
  }
  const includes = generateIncludeObject(5)
  const comments = await prisma.comment.findMany({
    where: {
      AND: {
        replyToId: replyToId ? Number(replyToId) : null,
        OR: [
          { challengeId: challengeId ? Number(challengeId) : undefined },
          { postId: postId ? Number(postId) : undefined },
          { threadId: threadId ? Number(threadId) : undefined },
          { checkInId: checkInId ? Number(checkInId) : undefined },
          { replyToId: replyToId ? Number(replyToId) : undefined }
        ]
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: includes
  })

  return comments
}
export const fetchReplies = async (commentId: string | number): Promise<prisma.comment[]> => {
  const id = Number(commentId)
  const includes = generateIncludeObject(5)
  return await prisma.comment.findUnique({
    where: { id },
    orderBy: {
      createdAt: 'desc'
    },
    include: includes
  })
}

export function recursivelyCollectCommentIds (comments: prisma.comment[]): number[] {
  const ids: number[] = []
  comments.forEach(comment => {
    ids.push(comment.id as number)
    if (comment.replies && comment.replies.length > 0) {
      ids.push(...recursivelyCollectCommentIds(comment.replies as prisma.comment[]))
    }
  })
  return ids
}

export const createComment = async (comment: prisma.commentCreateInput): Promise<prisma.comment> => {
  try {
    const newComment = await prisma.comment.create({
      data: comment
    })
    await updateCounts(newComment)
    return newComment
  } catch (error) {
    console.error('error', error)
    return error
  }
}
export const updateComment = async (comment: prisma.commentCreateInput): Promise<prisma.comment> => {
  const { id, ...data } = comment
  try {
    const newComment = await prisma.comment.update({
      where: { id },
      data
    })
    // update counts of replies
    void updateCounts(newComment)
    return newComment
  } catch (error) {
    console.error('error', error)
    return error
  }
}
export const loadComment = async (commentId: string | number, userId?: string | number | undefined): Promise<prisma.Comment> => {
  const id = Number(commentId)
  const where: prisma.commentWhereUniqueInput = { id }
  if (userId) {
    where.userId = Number(userId)
  }
  return await prisma.comment.findUnique({
    where,
    include: {
      user: {
        include: {
          profile: true
        }
      },
      challenge: true,
      post: true,
      thread: true
    }
  })
}

export const deleteComment = async (commentId: string | number): Promise<prisma.comment> => {
  const id = Number(commentId)
  const comment = await loadComment(id)
  if (comment?.imageMeta?.public_id) {
    await deleteFromCloudinary(comment.imageMeta.public_id as string, 'image')
  }
  if (comment?.videoMeta?.public_id) {
    await deleteFromCloudinary(comment.videoMeta.public_id as string, 'video')
  }
  const deleted = await prisma.comment.delete({
    where: {
      id
    }
  })
  await updateCounts(deleted)
  return deleted
}

const updateCounts = async (comment: prisma.comment): Promise<void> => {
  let count = 0
  if (comment.replyToId) {
    const replyToId = Number(comment.replyToId)
    count = await prisma.comment.count({
      where: { replyToId }
    })
    await prisma.comment.update({
      where: { id: replyToId },
      data: { replyCount: count }
    })
  }
  if (comment.postId) {
    const postId = Number(comment.postId)
    count = await prisma.comment.count({
      where: { postId }
    })
    await prisma.post.update({
      where: { id: postId },
      data: { commentCount: count }
    })
  }
  if (comment.challengeId) {
    const challengeId = Number(comment.challengeId)
    count = await prisma.comment.count({
      where: { challengeId }
    })
    await prisma.challenge.update({
      where: { id: challengeId },
      data: { commentCount: count }
    })
  }
  if (comment.threadId) {
    const threadId = Number(comment.threadId)
    count = await prisma.comment.count({
      where: { threadId }
    })
    await prisma.thread.update({
      where: { id: threadId },
      data: { commentCount: count }
    })
  }
  if (comment.checkInId) {
    const checkInId = Number(comment.checkInId)
    count = await prisma.comment.count({
      where: { checkInId }
    })
    await prisma.checkIn.update({
      where: { id: checkInId },
      data: { commentCount: count }
    })
  }
}
