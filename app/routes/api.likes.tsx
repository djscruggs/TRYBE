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
    if (noteId) where.noteId = noteId
    const result = await prisma.like.deleteMany({ where })
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
    return json(existingLike)
  }
  const like = await prisma.like.create({ data })
  return json(like)
}

export const loader: LoaderFunction = async (args) => {
  void requireCurrentUser(args)
  return json({ message: 'This route does not accept GET requests' }, 200)
}
