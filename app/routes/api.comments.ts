import { createComment, updateComment, loadComment, deleteComment } from '~/models/comment.server'
import type { prisma } from '~/models/prisma.server'
import { requireCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction, type ActionFunction } from '@remix-run/node'

export const action: ActionFunction = async (args) => {
  const currentUser = await requireCurrentUser(args)
  const formData = await args.request.formData()
  // is this a delete request?
  const intent = formData.get('intent')
  console.log('intent', intent)
  if (intent === 'delete') {
    const id = Number(formData.get('id'))
    const result = await deleteComment(id)
    return json(result)
  }

  const data: prisma.commentCreateInput = {
    body: formData.get('body'),
    user: { connect: { id: currentUser?.id } }
  }
  if (formData.get('id')) {
    data.id = Number(formData.get('id'))
  }
  // if this is a reply, the other relations will come from the parent
  const replyToId = formData.get('replyToId')
  if (!replyToId) {
    if (formData.get('postId')) {
      data.post = { connect: { id: Number(formData.get('postId')) } }
    }
    if (formData.get('challengeId')) {
      data.challenge = { connect: { id: Number(formData.get('challengeId')) } }
    }
    if (formData.get('threadId')) {
      data.thread = { connect: { id: Number(formData.get('threadId')) } }
    }
    if (!data.challenge && !data.post && !data.thread) {
      return json({ message: 'Post id or callenge id is required' }, 400)
    }
  }
  if (replyToId) {
    console.log('replyToId', replyToId)
    data.replyTo = { connect: { id: Number(replyToId) } }
    // increment the thread depth, requires fetching the parent comment
    const parentComment = await loadComment(replyToId as number)
    const { postId, challengeId } = parentComment
    if (postId) {
      data.post = { connect: { id: postId } }
    }
    if (challengeId) {
      data.challenge = { connect: { id: challengeId } }
    }
    data.threadDepth = parentComment.threadDepth >= 5 ? 5 : parentComment.threadDepth + 1
  }
  const result = data.id ? await updateComment(data) : await createComment(data)
  // refresh the comment to include user info attached
  const comment = await loadComment(result.id as number, result.userId as number)
  console.log('comment', comment)
  return json(comment)
}

export const loader: LoaderFunction = async (args) => {
  return json({ message: 'This route does not accept GET requests' }, 200)
}
