import { fetchComments } from '~/models/comment.server'
import { json, type LoaderFunction } from '@remix-run/node'
import { requireCurrentUser } from '~/models/auth.server'
export const loader: LoaderFunction = async (args) => {
  await requireCurrentUser(args)
  const { type, id } = args.params
  let query = {}

  switch (type) {
    case 'thread':
      query = { threadId: Number(id) }
      break
    case 'post':
      query = { postId: Number(id) }
      break
    case 'challenge':
      query = { challengeId: Number(id) }
      break
    case 'checkin':
      query = { checkInId: Number(id) }
      break
    case 'comment':
      query = { replyToId: Number(id) }
      break
    default:
      throw new Error('Invalid type parameter')
  }
  console.log('query', query)
  const comments = await fetchComments(query)
  console.log('comments', comments)
  return json(comments)
}
