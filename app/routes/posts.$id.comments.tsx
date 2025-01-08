import React, { useState, useContext } from 'react'
import { useParams, useLoaderData, json, useOutletContext } from '@remix-run/react'
import { type LoaderFunction } from '@remix-run/server-runtime'
import { useNavigate } from 'react-router-dom'
import { Button } from '@material-tailwind/react'
import type { Comment, CurrentUser } from '~/utils/types'
import CommentsContainer from '~/components/commentsContainer'
import FormComment from '~/components/formComment'
import { CurrentUserContext } from '~/contexts/CurrentUserContext'
import { fetchComments } from '~/models/comment.server'
import { likesByType } from '~/models/like.server'
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
  const likes = currentUser?.id ? await likesByType({ userId: currentUser.id }) : { comment: [] }
  return { commentsData: comments, postId }
}
export default function ViewPostComments (): JSX.Element {
  const { commentsData, postId } = useLoaderData<{ commentsData: Comment[], postId: number }>()
  const [comments, setComments] = useState<Comment[]>(commentsData as unknown as Comment[])
  const [showForm, setShowForm] = useState(commentsData.length === 0)

  // first comment holds the comment posted by the user
  // it's intiially null, but if they save a commennt it shows at the top
  const [newestComment, setNewestComment] = useState<Comment | null>(null)
  const saveNewestComment = (comment: Comment): void => {
    if (newestComment) {
      // push the comment to the top of the list
      const newComments = [newestComment].concat(comments)
      setComments(newComments)
    }
    setNewestComment(comment)
    setShowForm(false)
  }
  const currentUser = useContext(CurrentUserContext)
  const navigate = useNavigate()
  const params = useParams()
  return (
    <div className='max-w-[400px] md:max-w-lg mt-10'>
      {currentUser &&
      <div className="mb-8">
        {showForm
          ? (
              <div className="mt-1">
                {postId &&
                  <FormComment afterSave={saveNewestComment} onCancel={() => { setShowForm(false) }} postId={postId} />
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
    <CommentsContainer newestComment={newestComment} allowReplies={true} comments={comments} isReply={false} />
  </div>

  )
}
