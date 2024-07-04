import React, { useContext, useState } from 'react'
import { useParams, useLoaderData, json } from '@remix-run/react'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { type LoaderFunction } from '@remix-run/server-runtime'
import { fetchComments, recursivelyCollectCommentIds } from '~/models/comment.server'
import { commentIdsLikedByUser } from '~/models/like.server'
import FormComment from '~/components/formComment'
import CommentsContainer from '~/components/commentsContainer'
import { useRevalidator } from 'react-router-dom'
import { type CurrentUser } from '~/utils/types'
import { requireCurrentUser } from '~/models/auth.server'

export const loader: LoaderFunction = async (args) => {
  const currentUser: CurrentUser | null = await requireCurrentUser(args)
  const comments = await fetchComments({ challengeId: Number(args.params.id) })
  const commentIds = recursivelyCollectCommentIds(comments)
  const likedCommentIds: number[] = currentUser?.id ? await commentIdsLikedByUser({ commentIds, userId: currentUser.id }) : []
  if (!comments) {
    const error = { loadingError: 'Challenge not found' }
    return json(error)
  }
  return json({ comments, likedCommentIds })
}
export default function ViewChallengeComments (): JSX.Element {
  const revalidator = useRevalidator()
  const handleFormSubmit = (): void => {
    setShowForm(false)
    revalidator.revalidate()
  }
  const { comments, likedCommentIds } = useLoaderData<typeof loader>()
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
                  <FormComment afterSave={handleFormSubmit} onCancel={() => { setShowForm(false) }} challengeId={params.id ?? ''} />
                </div>
              )
            : (
                <button onClick={() => { setShowForm(true) }} className="mt-2 text-sm underline ml-2">Add a comment</button>
              )}
        </div>
      }
      <div className="max-w-sm">
        <CommentsContainer comments={comments} isReply={false} likedCommentIds={likedCommentIds} />

      </div>

    </>

  )
}
