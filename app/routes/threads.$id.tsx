import { loadThreadSummary } from '~/models/thread.server'
import { fetchComments, recursivelyCollectCommentIds } from '~/models/comment.server'
import { Outlet, useLoaderData, useLocation } from '@remix-run/react'
import { useState } from 'react'
import { requireCurrentUser } from '~/models/auth.server'
import type { ObjectData, ThreadSummary, Comment } from '~/utils/types'
import { json, type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { userHasLiked, commentIdsLikedByUser } from '~/models/like.server'
import FormComment from '~/components/formComment'
import CardThread from '~/components/cardThread'
import CommentsContainer from '~/components/commentsContainer'

interface ThreadData {
  thread: ThreadSummary
  hasLiked: boolean
  comments: Comment[]
  likedCommentIds: number[]
}
interface ErrorData {
  loadingError: string
}
export const loader: LoaderFunction = async (args: LoaderFunctionArgs): Promise<ThreadData | ErrorData | null> => {
  const currentUser = await requireCurrentUser(args)
  const { params } = args
  if (!params.id) {
    return null
  }
  const thread = await loadThreadSummary(params.id)
  if (!thread) {
    const error: ErrorData = { loadingError: 'Thread not found' }
    return error
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
  const likedCommentIds: number[] = currentUser ? await commentIdsLikedByUser({ commentIds, userId: currentUser.id }) : []
  const data: ThreadData = { thread: thread as unknown as ThreadSummary, hasLiked, comments, likedCommentIds }
  return data
}

export default function ViewThread (): JSX.Element {
  const location = useLocation()
  if (location.pathname.includes('edit') || location.pathname.includes('quote')) {
    return <Outlet />
  }
  const data: ThreadData | ErrorData = useLoaderData()
  if (!data) {
    return <p>No data.</p>
  }
  if ('loadingError' in data) {
    return <h1>{data.loadingError}</h1>
  }
  const [thread, setThread] = useState(data.thread)

  const { hasLiked, comments, likedCommentIds } = data
  if (!data?.thread) {
    return <p>Loading...</p>
  }
  const afterCommentSave = (comment: Comment): void => {
    comments.splice(0, 0, comment)
    setThread(comment?.thread as ThreadSummary)
  }

  return (
    <>
    <div className='w-dvw md:max-w-md lg:max-w-lg mt-10 p-4'>
      <CardThread thread={thread} hasLiked={hasLiked} />
      <div className='mt-2 w-full border-0  drop-shadow-none mr-2'>
          <FormComment threadId={thread.id} afterSave={afterCommentSave} prompt='Add your response' />
        </div>
    </div>
    {data.comments && data.comments.length > 0 &&
    <div className='max-w-[400px] md:max-w-md lg:max-w-lg'>
      <CommentsContainer comments={comments} likedCommentIds={likedCommentIds} isReply={false} />
    </div>
    }
    </>
  )
}
