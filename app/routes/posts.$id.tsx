import { loadPostSummary } from '~/models/post.server'
import { Outlet, useLoaderData, useLocation } from '@remix-run/react'

import CardPost from '~/components/cardPost'
import { requireCurrentUser } from '../models/auth.server'
import type { Post } from '~/utils/types'
import { json, type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { prisma } from '../models/prisma.server'
import getUserLocale from 'get-user-locale'

export interface PostData {
  post: Post | null
  hasLiked: boolean
  locale?: string
  loadingError?: string
}

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  const currentUser = await requireCurrentUser(args)
  const { params } = args
  if (!params.id) {
    return null
  }
  const locale = getUserLocale()
  const post: Post | null = await loadPostSummary(params.id)
  // error if no post OR it's not a preview by the user who created it
  if (!post || (!post.published && post.userId !== currentUser?.id)) {
    const error = { loadingError: 'Post not found' }
    return json(error)
  }
  // load likes for current user if it exists
  let hasLiked = false
  if (currentUser) {
    // has the user liked this note?
    const likes = await prisma.like.count({
      where: {
        postId: Number(post.id),
        userId: Number(currentUser.id)
      }
    })
    hasLiked = likes > 0
  }

  const data: PostData = { post, hasLiked, locale }
  return json(data)
}

export default function ViewPost (): JSX.Element {
  const location = useLocation()
  if (location.pathname.includes('edit')) {
    return <Outlet />
  }

  const { post, hasLiked, loadingError, locale } = useLoaderData() as PostData
  if (loadingError) {
    return <h1>{loadingError}</h1>
  }
  if (!post) {
    return <p>Loading...</p>
  }
  return (
    <>
    <div className='max-w-[400px] md:max-w-md mt-10'>
      <CardPost post={post} hasLiked={Boolean(hasLiked)} locale={locale} fullPost={true} />
    </div>

    </>
  )
}
