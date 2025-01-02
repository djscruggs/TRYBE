import { Outlet, useLoaderData } from '@remix-run/react'
import React from 'react'
import { requireCurrentUser } from '~/models/auth.server'
import type { Post } from '~/utils/types'
import { type MetaFunction, type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { prisma } from '~/models/prisma.server'
import CardPost from '~/components/cardPost'

export const meta: MetaFunction = () => {
  return [
    { title: 'Posts' },
    {
      property: 'og:title',
      content: 'Posts'
    }
  ]
}
interface ViewChallengePostsData {
  posts: Post[] | null
}

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  await requireCurrentUser(args)
  const { params } = args
  if (!params.id) {
    return null
  }

  // load posts
  const posts = await prisma.post.findMany({
    where: {
      AND: {
        challengeId: Number(params.id),
        published: true,
        OR: [
          { publishAt: null },
          { publishAt: { lte: new Date() } }
        ]
      }
    },
    include: {
      _count: {
        select: { comments: true, likes: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  const data: ViewChallengePostsData = { posts }
  return data
}
export default function ViewChallengePosts (): JSX.Element {
  const data: ViewChallengePostsData = useLoaderData<typeof loader>()
  const { posts } = data

  if (!data) {
    return <p>No data.</p>
  }

  return (
    <>
      {posts?.map((post) => {
        return (
            <div key={`post-${post.id}`} className='max-w-sm md:max-w-md lg:max-w-lg mb-6'>
              <CardPost post={post} hideMeta={true} fullPost={false}/>
            </div>
        )
      })}
      <div className='mb-16'>
        <Outlet />
      </div>
</>
  )
}
