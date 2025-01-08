import React, { useContext, useState } from 'react'
import { useParams, useLoaderData, json, type MetaFunction } from '@remix-run/react'
import { CurrentUserContext } from '~/contexts/CurrentUserContext'
import { type LoaderFunction } from '@remix-run/server-runtime'
import { fetchComments } from '~/models/comment.server'
import { likesByType } from '~/models/like.server'
import FormComment from '~/components/formComment'
import CommentsContainer from '~/components/commentsContainer'
import { useRevalidator } from 'react-router-dom'
import { type CurrentUser } from '~/utils/types'
import { requireCurrentUser } from '~/models/auth.server'
export const meta: MetaFunction = () => {
  return [
    { title: 'Comments' },
    {
      property: 'og:title',
      content: 'Comments'
    }
  ]
}
export const loader: LoaderFunction = async (args) => {
  const currentUser: CurrentUser | null = await requireCurrentUser(args)
  const comments = await fetchComments({ challengeId: Number(args.params.id) })
  if (!comments) {
    const error = { loadingError: 'Challenge not found' }
    return json(error)
  }
  return json({ comments })
}
export default function ViewChallengeComments (): JSX.Element {
  const revalidator = useRevalidator()
  const handleFormSubmit = (): void => {
    setShowForm(false)
    revalidator.revalidate()
  }
  const { comments } = useLoaderData<typeof loader>()
  const [showForm, setShowForm] = useState(comments.length === 0)

  const params = useParams()
  const currentUser = useContext(CurrentUserContext)
  return (
    <>
      <span id="comments">Comments</span>
      {currentUser &&
        <div className="mb-8 max-w-sm">
          {showForm
            ? (
                <div className="mt-1">
                  <FormComment afterSave={handleFormSubmit} onCancel={() => { setShowForm(false) }} challengeId={Number(params.id) ?? null} />
                </div>
              )
            : (
                <button onClick={() => { setShowForm(true) }} className="mt-2 text-sm underline ml-2">Add a comment</button>
              )}
        </div>
      }
      <div className="max-w-sm">
        <CommentsContainer comments={comments} isReply={false} allowReplies={true} />

      </div>

    </>

  )
}
