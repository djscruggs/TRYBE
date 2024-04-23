import React, { useState, useContext } from 'react'
import { useNavigate } from '@remix-run/react'
import FormComment from './formComment'
import { Avatar, Button } from '@material-tailwind/react'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { convertlineTextToHtml } from '~/utils/helpers'
import type { Comment } from '~/utils/types'
import CommentItem from './commentItem'

interface CommentsProps {
  challengeId?: number
  postId?: number
  comments: Comment[]
  handleFormSubmit: () => void
}

export default function Comments (props: CommentsProps): JSX.Element {
  const { challengeId, postId, comments, handleFormSubmit } = props
  const [showForm, setShowForm] = useState(false)
  const currentUser = useContext(CurrentUserContext)
  const navigate = useNavigate()

  return (
    <>
    {currentUser &&
      <div className="mb-8">
        {showForm
          ? (
              <div className="mt-1">
                {challengeId &&
                  <FormComment afterSave={() => { handleFormSubmit(); setShowForm(false) }} onCancel={() => { setShowForm(false) }} challengeId={challengeId} />
                }
                {postId &&
                  <FormComment afterSave={() => { handleFormSubmit(); setShowForm(false) }} onCancel={() => { setShowForm(false) }} postId={postId} />
                }
              </div>
            )
          : (
              <button onClick={() => { setShowForm(true) }} className="mt-2 text-sm underline ml-2">Add a comment</button>
            )}
      </div>
    }
    {!currentUser &&
      <div className='text-center mb-4'>
        <p>You must be a registered user to comment</p>
        <Button onClick={() => { navigate('/signup') }} className="bg-red p-2 mt-2">Sign Up</Button>
      </div>
    }
    <div className="max-w-sm md:max-w-lg" id='comments'>
      {comments.map((comment) => {
        return (
          <CommentItem comment={comment} />

        )
      })}
    </div>

  </>
  )
}
