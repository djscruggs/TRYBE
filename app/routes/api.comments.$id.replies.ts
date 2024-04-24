import { fetchRepliest } from '~/models/comment.server'
import { type prisma } from './prisma.server'
import { requireCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction, type ActionFunction } from '@remix-run/node'

export const loader: LoaderFunction = async (args) => {
  const currentUser = await requireCurrentUser(args)
  const replies = await fetchReplies(args.params.id)
  return json(replies, 200)
}
