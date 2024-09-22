import { loadUser } from '~/models/user.server'
import { json, type LoaderFunction } from '@remix-run/node'
import { type Like } from '~/utils/types'
import { prisma } from '~/models/prisma.server'

export const loader: LoaderFunction = async (args) => {
  const user = await loadUser(args.params.id)
  const likes = await prisma.like.findMany({
    where: {
      userId: user.id
    },
    select: {
      id: true,
      postId: true,
      commentId: true,
      challengeId: true,
      checkinId: true,
      threadId: true
    }
  })
  interface LikesByType {
    post: number[]
    comment: number[]
    challenge: number[]
    checkin: number[]
    thread: number[]
  }
  const likesByType = likes.reduce((acc: LikesByType, like: Like) => {
    if (like.postId) {
      acc.post.push(like.postId)
    }
    if (like.commentId) {
      acc.comment.push(like.commentId)
    }
    if (like.challengeId) {
      acc.challenge.push(like.challengeId)
    }
    if (like.checkinId) {
      acc.checkin.push(like.checkinId)
    }
    if (like.threadId) {
      acc.thread.push(like.threadId)
    }
    return acc
  }, { post: [], comment: [], challenge: [], checkin: [], thread: [] })
  return json(likesByType)
}
