import React from 'react'
import { useParams, useLoaderData, json } from '@remix-run/react'
import { type LoaderFunction } from '@remix-run/server-runtime'
import { fetchComments } from '~/models/comment.server'
import { useRevalidator } from 'react-router-dom'
import type { Comment } from '~/utils/types'
import Comments from '~/components/comments'
export const loader: LoaderFunction = async ({ request, params }) => {
  const result = await fetchComments({ postId: Number(params.id) })

  if (!result) {
    const error = { loadingError: '{pst} not found' }
    return json(error)
  }
  const data: Comment[] = result
  return data
}
export default function ViewPostComments (): JSX.Element {
  const revalidator = useRevalidator()
  const handleFormSubmit = (): void => {
    revalidator.revalidate()
  }
  const comments = useLoaderData<Comment[]>()

  const params = useParams()
  return (
    <div className='max-w-[400px] md:max-w-lg mt-10'>
      <Comments comments={comments} handleFormSubmit={handleFormSubmit} postId={Number(params.id)} />
    </div>

  )
}
