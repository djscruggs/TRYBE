import { loadPostSummary } from '~/models/post.server'
import { type Post } from '~/utils/types'
import { type LoaderFunction, type LoaderFunctionArgs } from 'react-router'

export const loader: LoaderFunction = async (
  args: LoaderFunctionArgs
): Promise<Post | null | { error: string }> => {
  const { params } = args
  if (!params.id) {
    return null
  }
  const post = await loadPostSummary(params.id)
  if (!post) {
    const error = { error: 'Post not found' }
    return error
  }
  return post as Post
}
