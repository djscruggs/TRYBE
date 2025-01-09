import { createComment, updateComment, loadComment, deleteComment } from '~/models/comment.server'
import { sendCommentReplyNotification } from '~/utils/mailer'
import { requireCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction, type ActionFunction } from '@remix-run/node'
import { unstable_parseMultipartFormData } from '@remix-run/node'
import { uploadHandler, handleFormUpload } from '~/utils/uploadFile'
import { generateUrl } from '~/utils/helpers'
import { loadCheckIn, loadChallengeSummary } from '~/models/challenge.server'
import { loadPost } from '~/models/post.server'
import { loadThread } from '~/models/thread.server'
import { prisma } from '~/models/prisma.server'

export const action: ActionFunction = async (args) => {
  const currentUser = await requireCurrentUser(args)
  const { request } = args
  const rawData = await unstable_parseMultipartFormData(request, uploadHandler)
  const formData = Object.fromEntries(rawData)
  // is this a delete request?
  const intent = formData.intent
  if (intent === 'delete') {
    const id = Number(formData.id)
    const result = await deleteComment(id)
    return json(result)
  }
  const data: prisma.commentCreateInput = {
    body: formData.body,
    user: { connect: { id: currentUser?.id } }
  }
  if (formData.id) {
    data.id = Number(formData.id)
  }
  // if this is a reply, the other relations will come from the parent
  const replyToId = formData.replyToId
  if (!replyToId && !data.id) {
    if (formData.postId) {
      data.post = { connect: { id: Number(formData.postId) } }
    }
    if (formData.challengeId) {
      data.challenge = { connect: { id: Number(formData.challengeId) } }
    }
    if (formData.threadId) {
      data.thread = { connect: { id: Number(formData.threadId) } }
    }
    if (formData.checkInId) {
      data.checkIn = { connect: { id: Number(formData.checkInId) } }
    }
    if (typeof formData.cohortId === 'string') {
      data.cohort = { connect: { id: Number(formData.cohortId) } }
    }
    if (!data.challenge && !data.post && !data.thread && !data.checkIn) {
      return json({ message: 'Post id or callenge id or thread id or checkin id is required' }, 400)
    }
    // there might be a bug when a challenge id is submitted but cohort id is no, so do a quick search for the memberchallenge that might have it
    if (data.challenge && !data.cohort) {
      const memberChallenge = await prisma.memberChallenge.findFirst({
        where: {
          challengeId: data.challenge.id,
          userId: currentUser?.id
        }
      })
      if (memberChallenge?.cohortId) {
        data.cohort = { connect: { id: memberChallenge.cohortId } }
      }
    }
  }

  if (replyToId) {
    data.replyTo = { connect: { id: Number(replyToId) } }
    // increment the thread depth, requires fetching the parent comment
    const parentComment = await loadComment(replyToId as unknown as number)
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
  await handleFormUpload({ formData: rawData, dataObj: result, nameSpace: 'comment', onUpdate: updateComment })

  const updated = await updateComment(result)
  if (updated.replyToId || updated.checkInId || updated.postId || updated.challengeId || updated.threadId) {
    let parent
    let type = ''
    let sendNotification = false
    if (updated.replyToId) {
      parent = await loadComment(updated.replyToId as unknown as number)
      type = 'comment'
    } else if (updated.postId) {
      parent = await loadPost(Number(updated.postId))
      type = 'post'
    } else if (updated.challengeId) {
      parent = await loadChallengeSummary(Number(updated.challengeId))
      type = 'challenge'
    } else if (updated.threadId) {
      parent = await loadThread(Number(updated.threadId))
      type = 'thread'
    } else if (updated.checkInId) {
      parent = await loadCheckIn(Number(updated.checkInId))
      type = 'checkIn'
    }
    const challengeId = parent?.challengeId
    // only send notification if they are replying to a comment, post checkin or thread
    if (parent && challengeId && (updated.postId || updated.replyToId || updated.threadId || updated.checkInId)) {
      sendNotification = true
    }
    if (sendNotification) {
      const commentUrl = generateUrl(`/challenges/v/${challengeId}/chat#${type}-${parent.id}`)
      void sendCommentReplyNotification({
        to: parent?.user?.email,
        dynamic_template_data: {
          toName: parent?.user.profile.firstName ?? 'Trybe Friend',
          fromName: currentUser?.profile?.fullName ?? 'Anonymous',
          body: result.body as string,
          challenge_name: parent?.name,
          comment_url: commentUrl,
          subject: updated.replyToId ? 'Reply to your comment' : 'New comment on your challenge'
        }
      })
    }
  }

  // refresh the comment to include user info attached
  const comment = await loadComment(updated.id as number, updated.userId as number)
  return json(comment)
}

export const loader: LoaderFunction = async (args) => {
  return json({ message: 'This route does not accept GET requests' }, 200)
}
