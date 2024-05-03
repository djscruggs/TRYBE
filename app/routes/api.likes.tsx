import { requireCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction, type ActionFunction, type ActionFunctionArgs } from '@remix-run/node'
import { prisma, prisma } from '../models/prisma.server'
import { type Like } from '@prisma/client'

export const action: ActionFunction = async (args: ActionFunctionArgs) => {
  const currentUser = await requireCurrentUser(args)
  const formData = await args.request.formData()
  const challengeId: number | null = formData.get('challengeId') ? Number(formData.get('challengeId')) : null
  const commentId: number | null = formData.get('commentId') ? Number(formData.get('commentId')) : null
  const postId: number | null = formData.get('postId') ? Number(formData.get('postId')) : null
  const noteId: number | null = formData.get('noteId') ? Number(formData.get('noteId')) : null
  const threadId: number | null = formData.get('threadId') ? Number(formData.get('threadId')) : null
  let where: prisma.likeWhere = {}
  let totalLikes = 0
  if (formData.get('unlike')) {
    where = { userId: currentUser?.id }
    if (challengeId) where.challengeId = challengeId
    if (commentId) where.commentId = commentId
    if (postId) where.postId = postId
    if (noteId) where.noteId = noteId
    if (threadId) where.threadId = threadId
    const like = await prisma.like.deleteMany({ where })
    const toUpdate = { challengeId, commentId, postId, noteId }
    void updateLikeCounts(toUpdate)
    return json({ like })
  }

  const data: prisma.likeCreateInput = {
    user: { connect: { id: currentUser?.id } }
  }
  let fieldName = ''
  let itemId = 0
  if (challengeId) {
    data.challenge = { connect: { id: challengeId } }
    itemId = where.challengeId = challengeId
    fieldName = 'challengeId'
  }
  if (commentId) {
    data.comment = { connect: { id: commentId } }
    itemId = where.commentId = commentId
    fieldName = 'commentId'
  }
  if (postId) {
    data.post = { connect: { id: postId } }
    itemId = where.postId = postId
    fieldName = 'postId'
  }
  if (noteId) {
    data.note = { connect: { id: noteId } }
    itemId = where.noteId = noteId
    fieldName = 'noteId'
  }
  if (threadId) {
    data.thread = { connect: { id: threadId } }
    itemId = where.threadId = threadId
    fieldName = 'threadId'
  }
  // first see if it already exists
  const existingLike = await prisma.like.findFirst({ where })
  if (existingLike) {
    console.log('existing like', existingLike)
    void updateLikeCounts(existingLike)
    totalLikes = await getLikeCount(itemId, fieldName)
    console.log('totalLikes', totalLikes)
    return json({ like: existingLike, totalLikes })
  }
  const like = await prisma.like.create({ data })
  await updateLikeCounts(like)
  totalLikes = await getLikeCount(itemId, fieldName)
  return { like, totalLikes }
}

export const loader: LoaderFunction = async (args) => {
  void requireCurrentUser(args)
  return json({ message: 'This route does not accept GET requests' }, 200)
}

const getLikeCount = async (itemId: number, fieldName: string): Promise<number> => {
  const count = await prisma.like.count({ where: { [fieldName]: itemId } })
  return count
}

const updateLikeCounts = async (like: Partial<Like>): Promise<any> => {
  const { challengeId, commentId, postId, noteId, threadId } = like
  try {
    if (challengeId) {
      const chLikes = await prisma.like.count({ where: { challengeId } })
      return await prisma.challenge.update({
        where: { id: challengeId },
        data: { likeCount: chLikes }
      })
    }
    if (commentId) {
      const cLikes = await prisma.like.count({ where: { commentId } })
      return await prisma.comment.update({
        where: { id: commentId },
        data: { likeCount: cLikes }
      })
    }
    if (postId) {
      const pLikes = await prisma.like.count({ where: { postId } })
      return await prisma.post.update({
        where: { id: postId },
        data: { likeCount: pLikes }
      })
    }
    if (noteId) {
      const nLikes = await prisma.like.count({ where: { noteId } })
      return await prisma.note.update({
        where: { id: noteId },
        data: { likeCount: nLikes }
      })
    }
    if (threadId) {
      const tLikes = await prisma.like.count({ where: { threadId } })
      return await prisma.thread.update({
        where: { id: threadId },
        data: { likeCount: tLikes }
      })
    }
  } catch (error) {
    console.log('error updating counts', error)
    return error
  }
}
