import { loadThreadSummary } from '~/models/thread.server'
import { fetchComments, recursivelyCollectCommentIds } from '~/models/comment.server'
import { Outlet, useLoaderData, useLocation } from '@remix-run/react'

import { requireCurrentUser } from '../models/auth.server'
import type { ObjectData, ThreadSummary } from '~/utils/types'
import { json, type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { userHasLiked, commentIdsLikedByUser } from '~/models/like.server'

import CardThread from '~/components/cardThread'
import CommentsContainer from '~/components/commentsContainer'

interface ThreadData {
  thread: ThreadSummary
  hasLiked: boolean
  comments: Comment[]
}

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  const currentUser = await requireCurrentUser(args)
  const { params } = args
  if (!params.id) {
    return null
  }
  const thread = await loadThreadSummary(params.id)
  if (!thread) {
    const error = { loadingError: 'Thread not found' }
    return json(error)
  }
  // load memberships & likes for current user if it exists
  let hasLiked = false
  if (currentUser) {
    // has the user liked this thread?
    const threadlikeCount = await userHasLiked({ threadId: thread.id })
    hasLiked = threadlikeCount > 0
  }
  // get comments
  const comments = await fetchComments({ threadId: thread.id })
  const commentIds = recursivelyCollectCommentIds(comments)
  const likedCommentIds: number[] = await commentIdsLikedByUser({ commentIds })
  const data: ThreadData = { thread, hasLiked, comments, likedCommentIds }
  return json(data)
}

export default function ViewThread (): JSX.Element {
  const location = useLocation()
  if (location.pathname.includes('edit') || location.pathname.includes('quote')) {
    return <Outlet />
  }

  const data: ObjectData = useLoaderData() as ObjectData
  if (!data) {
    return <p>No data.</p>
  }
  if (data?.loadingError) {
    return <h1>{data.loadingError}</h1>
  }
  if (!data?.thread) {
    return <p>Loading...</p>
  }
  return (
    <>
    <div className='w-dvw md:max-w-md lg:max-w-lg mt-10 p-4'>
      <CardThread thread={data.thread} hasLiked={Boolean(data.hasLiked)} />
    </div>
    {data.comments && data.comments.length > 0 &&
    <div className='max-w-[400px] md:max-w-md lg:max-w-lg'>
      <CommentsContainer comments={data.comments as unknown as Comment[]} likedCommentIds={data.likedCommentIds as unknown as number[]} />
    </div>
    }
    </>
  )
}
