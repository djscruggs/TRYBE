import { loadThreadSummary } from '~/models/thread.server'
import { Outlet, useLoaderData, useLocation } from '@remix-run/react'

import { requireCurrentUser } from '../models/auth.server'
import type { ObjectData, ThreadSummary } from '~/utils/types'
import { json, type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { prisma } from '../models/prisma.server'
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
    const likes = await prisma.like.count({
      where: {
        threadId: thread.id,
        userId: Number(currentUser.id)
      }
    })
    hasLiked = likes > 0
  }
  // get replies
  const comments = await prisma.comment.findMany({
    where: {
      threadId: thread.id
    },
    include: {
      user: {
        include: {
          profile: true
        }
      }
    }
  })
  const data: ThreadData = { thread, hasLiked, comments }
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
    <div className='max-w-[400px] md:max-w-md lg:max-w-lg'>
      <CommentsContainer comments={data.comments as Comment[]} />
    </div>
    </>
  )
}
