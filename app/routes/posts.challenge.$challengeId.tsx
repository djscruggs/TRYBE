import { requireCurrentUser } from '../models/auth.server'
import { type LoaderFunction } from '@remix-run/node'
import React, { useLoaderData } from '@remix-run/react'
import { prisma } from '~/models/prisma.server'
import type { Post } from '@prisma/client'
import CardPost from '~/components/cardPost'

interface PostsChallengeLoaderData {
  posts: Post[]
}
export const loader: LoaderFunction = async (args) => {
  await requireCurrentUser(args)
  const { params } = args
  if (!params.challengeId) {
    return null
  }
  const posts = await prisma.post.findMany({
    where: {
      challengeId: Number(params.challengeId)
    },
    include: {
      user: {
        include: { profile: true }
      }
    }
  })
  const data: PostsChallengeLoaderData = { posts }
  return data
}

export default function PostsLayout (): JSX.Element {
  const { posts } = useLoaderData<PostsChallengeLoaderData>()
  if (posts.length === 0) {
    return <div>No posts for this challenge</div>
  }
  return (
    <div className='max-w-screen md:max-w-lg mt-10'>
      {posts.map((post) => (
        <CardPost key={post.id} post={post} fullPost={true} />
      ))}
    </div>
  )
}
