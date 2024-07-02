import React, { useState, useContext } from 'react'
import { useParams, useLoaderData, json, useOutletContext } from '@remix-run/react'
import { type LoaderFunction } from '@remix-run/server-runtime'
import { useNavigate } from 'react-router-dom'
import { Button } from '@material-tailwind/react'
import type { Comment, CurrentUser } from '~/utils/types'
import CommentsContainer from '~/components/commentsContainer'
import FormComment from '~/components/formComment'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { fetchComments, recursivelyCollectCommentIds } from '~/models/comment.server'
import { commentIdsLikedByUser } from '~/models/like.server'
import { type LoaderFunctionArgs } from '@remix-run/node'
import { requireCurrentUser } from '~/models/auth.server'

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  const currentUser: CurrentUser | null = await requireCurrentUser(args)
  const postId = Number(args.params.id)
  const result = await fetchComments({ postId })

  if (!result) {
    const error = { loadingError: '{pst} not found' }
    return json(error)
  }
  const comments: Comment[] = result
  const commentIds = recursivelyCollectCommentIds(comments)
  const likedCommentIds: number[] = currentUser?.id ? await commentIdsLikedByUser({ commentIds, userId: currentUser.id }) : []

  return { commentsData: comments, postId, likedCommentIds }
}
export default function ViewPostComments (): JSX.Element {
  const { commentsData, postId, likedCommentIds } = useLoaderData<{ commentsData: Comment[], postId: number, likedCommentIds: number[] }>()
  const [comments, setComments] = useState<Comment[]>(commentsData as unknown as Comment[])
  const [showForm, setShowForm] = useState(commentsData.length === 0)

  // first comment holds the comment posted by the user
  // it's intiially null, but if they save a commennt it shows at the top
  const [firstComment, setFirstComment] = useState<Comment | null>(null)
  const saveFirstComment = (comment: Comment): void => {
    if (firstComment) {
      // push the comment to the top of the list
      const newComments = [firstComment].concat(comments)
      setComments(newComments)
    }
    setFirstComment(comment)
    setShowForm(false)
  }
  const currentUser = useContext(CurrentUserContext)
  const navigate = useNavigate()
  const params = useParams()
  console.log('comments', comments)
  return (
    <div className='max-w-[400px] md:max-w-lg mt-10'>
      {currentUser &&
      <div className="mb-8">
        {showForm
          ? (
              <div className="mt-1">
                {postId &&
                  <FormComment afterSave={saveFirstComment} onCancel={() => { setShowForm(false) }} postId={postId} />
                }
              </div>
            )
          : (
              <button onClick={() => { setShowForm(true) }} className="mt-2 text-sm underline ml-2 text-red">Add a comment</button>
            )}
      </div>
    }
    {!currentUser &&
      <div className='text-center mb-4'>
        <p>You must be a registered user to comment</p>
        <Button onClick={() => { navigate('/signup') }} className="bg-red p-2 mt-2">Sign Up</Button>
      </div>
    }
    <CommentsContainer firstComment={firstComment} comments={comments} isReply={false} likedCommentIds={likedCommentIds}/>
  </div>

  )
}
