import { loadPostSummary } from '~/models/post.server'
import { useState } from 'react'
import { Outlet, useLoaderData, useLocation } from '@remix-run/react'
import CardPost from '~/components/cardPost'
import ChallengeHeader from '~/components/challengeHeader'
import { requireCurrentUser } from '~/models/auth.server'
import type { PostSummary } from '~/utils/types'
import { json, type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'

export interface PostData {
  post: PostSummary | null
  loadingError?: string
}

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  const currentUser = await requireCurrentUser(args)
  const { params } = args
  if (!params.id) {
    return null
  }
  const post = await loadPostSummary(params.id) as PostSummary | null
  // error if no post OR it's not a preview by the user who created it
  if (!post || (!post.published && post.userId !== currentUser?.id)) {
    const error = { loadingError: 'Post not found' }
    return json(error)
  }
  const data: PostData = { post }
  return json(data)
}

export default function ViewPost (): JSX.Element {
  const location = useLocation()
  if (location.pathname.includes('edit')) {
    return <Outlet />
  }
  const { loadingError, post } = useLoaderData() as PostData
  if (loadingError) {
    return <h1>{loadingError}</h1>
  }
  const [_post] = useState<PostSummary | null>(post ?? null)
  if (!post) {
    return <p>Loading...</p>
  }
  return (
    <>
    {post.challenge && <ChallengeHeader size='small' challenge={post.challenge} />}
    <div className='w-screen px-4 md:px-0 md:max-w-xl mt-10'>
      <CardPost post={_post} fullPost={true} />
    </div>
    <Outlet context={{ post }} />
    </>
  )
}
