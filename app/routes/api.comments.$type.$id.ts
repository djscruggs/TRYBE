import { fetchComments } from '~/models/comment.server'
import { type LoaderFunction } from 'react-router'

export const loader: LoaderFunction = async (args) => {
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
  const comments = await fetchComments(query)
  return comments
}
