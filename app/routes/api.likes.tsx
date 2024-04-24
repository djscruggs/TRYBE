import { requireCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction, type ActionFunction, type ActionFunctionArgs } from '@remix-run/node'
import { prisma } from '../models/prisma.server'
import { type Like } from '@prisma/client'

export const action: ActionFunction = async (args: ActionFunctionArgs) => {
  const currentUser = await requireCurrentUser(args)
  const formData = await args.request.formData()
  const challengeId: number | null = formData.get('challengeId') ? Number(formData.get('challengeId')) : null
  const commentId: number | null = formData.get('commentId') ? Number(formData.get('commentId')) : null
  const postId: number | null = formData.get('postId') ? Number(formData.get('postId')) : null
  const noteId: number | null = formData.get('noteId') ? Number(formData.get('noteId')) : null
  let where: prisma.likeWhere = {}

  if (formData.get('unlike')) {
    where = { userId: currentUser?.id }
    if (challengeId) where.challengeId = challengeId
    if (commentId) where.commentId = commentId
    if (postId) where.postId = postId
    if (noteId) where.noteId = noteId
    const result = await prisma.like.deleteMany({ where })
    const like = { challengeId, commentId, postId, noteId }
    void updateLikeCounts(like)
    return json(result)
  }

  const data: prisma.likeCreateInput = {
    user: { connect: { id: currentUser?.id } }
  }
  if (challengeId) {
    data.challenge = { connect: { id: challengeId } }
    where.challengeId = challengeId
  }
  if (commentId) {
    data.comment = { connect: { id: commentId } }
    where.commentId = commentId
  }
  if (postId) {
    data.post = { connect: { id: postId } }
    where.postId = postId
  }
  if (noteId) {
    data.note = { connect: { id: noteId } }
    where.noteId = noteId
  }
  // first see if it already exists
  const existingLike = await prisma.like.findFirst({ where })
  if (existingLike) {
    console.log('existing like', existingLike)
    void updateLikeCounts(existingLike)
    return json(existingLike)
  }
  const like = await prisma.like.create({ data })
  console.log('like created', like)
  void updateLikeCounts(like)
  return json(like)
}

export const loader: LoaderFunction = async (args) => {
  void requireCurrentUser(args)
  return json({ message: 'This route does not accept GET requests' }, 200)
}

const updateLikeCounts = async (like: Like) => {
  const { challengeId, commentId, postId, noteId } = like
  try {
    if (challengeId) {
      const chLikes = await prisma.like.count({ where: { challengeId } })
      await prisma.challenge.update({
        where: { id: challengeId },
        data: { likeCount: chLikes }
      })
    }
    if (commentId) {
      const cLikes = await prisma.like.count({ where: { commentId } })
      await prisma.comment.update({
        where: { id: commentId },
        data: { likeCount: cLikes }
      })
    }
    if (postId) {
      const pLikes = await prisma.like.count({ where: { postId } })
      await prisma.post.update({
        where: { id: postId },
        data: { likeCount: pLikes }
      })
    }
    if (noteId) {
      const nLikes = await prisma.like.count({ where: { noteId } })
      await prisma.note.update({
        where: { id: noteId },
        data: { likeCount: nLikes }
      })
    }
  } catch (error) {
    console.log('error updating counts', error)
  }
}
