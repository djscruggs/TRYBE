import React, { useContext, useState } from 'react'
import { useParams, useLoaderData, json } from '@remix-run/react'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { type LoaderFunction } from '@remix-run/server-runtime'
import { fetchComments } from '~/models/comment.server'
import FormComment from '~/components/formComment'
import { useRevalidator } from 'react-router-dom'
export const loader: LoaderFunction = async ({ request, params }) => {
  const result = await fetchComments({ challengeId: params.id })

  if (!result) {
    const error = { loadingError: 'Challenge not found' }
    return json(error)
  }
  const data: Array<Record<string, any>> = result
  return json(data)
}
export default function ViewChallengeComments (): JSX.Element {
  const revalidator = useRevalidator()
  const handleFormSubmit = (): void => {
    setShowForm(false)
    revalidator.revalidate()
  }
  const comments = useLoaderData() as Array<Record<string, any>>
  const [showForm, setShowForm] = useState(comments.length === 0)

  const params = useParams()
  const currentUser = useContext(CurrentUserContext)
  return (
    <>
      <span id="comments">Comments</span>
      {currentUser &&
        <div className="mb-8">
          {showForm
            ? (
                <div className="mt-1">
                  <FormComment afterSave={handleFormSubmit} onCancel={() => { setShowForm(false) }} challengeId={params.id ?? ''} />
                </div>
              )
            : (
                <button onClick={() => { setShowForm(true) }} className="mt-2 text-sm underline ml-2">Add a comment</button>
              )}
        </div>
      }
      <div className="max-w-sm">
        {comments.map((comment) => {
          return (
            <div key={comment.id} className='mb-2 p-4 border border-gray-200 break-all rounded-md even:bg-white odd:bg-gray-50'>
              <div>{comment.user.profile?.firstName} {comment.user.profile?.lastName}</div>
              <div> {comment.body}</div>
            </div>
          )
        })}
      </div>

    </>

  )
}
