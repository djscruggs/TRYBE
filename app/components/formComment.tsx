import React, { useState, useContext } from 'react'
import { Form } from '@remix-run/react'
import axios from 'axios'
import { FormField } from './formField'
import type { Comment } from '~/utils/types'
import { toast } from 'react-hot-toast'
import { Button, Avatar } from '@material-tailwind/react'
import { CurrentUserContext } from '~/utils/CurrentUserContext'

interface FormCommentProps {
  challengeId?: number
  postId?: number
  replyToId?: number
  threadId?: number
  afterSave: (comment: Comment) => void
  onCancel?: () => void
  comment?: Comment
}

export default function FormComment (props: FormCommentProps): JSX.Element {
  let { comment, challengeId, postId, replyToId, threadId } = props
  if (comment) {
    challengeId = comment.challengeId
    postId = comment.postId
  }
  const { currentUser } = useContext(CurrentUserContext)
  const [body, setBody] = useState(comment ? comment.body : '')
  const [error, setError] = useState('')
  async function handleSubmit (ev: React.FormEvent<HTMLFormElement>): Promise<void> {
    ev.preventDefault()
    if (body.length < 10) {
      setError('Comment must be at least 10 characters long')
    }
    try {
      const formData = new FormData()
      formData.append('body', body)

      if (replyToId) {
        formData.append('replyToId', String(replyToId))
      }
      if (threadId) {
        formData.append('threadId', String(threadId))
      }
      if (challengeId) {
        formData.append('challengeId', String(challengeId))
      }
      if (postId) {
        formData.append('postId', String(postId))
      }
      if (comment?.id) {
        formData.append('id', String(comment.id))
      }
      const updated = await axios.post('/api/comments', formData)
      setBody('')
      if (props.afterSave) {
        props.afterSave(updated.data as Comment)
      }
      toast.success('Comment saved')
    } catch (error: any) {
      toast.error(error?.message)
    }
  }
  const handleCancel = (ev: React.FormEvent<HTMLFormElement>): void => {
    ev.preventDefault()
    if (props.onCancel) {
      props.onCancel()
    }
  }
  return (
    <div className='w-full flex'>
      <div className='w-md pt-1'>
      {currentUser?.profile &&
        <Avatar src={currentUser.profile.profileImage} className='mr-2' size='sm'/>
      }
      </div>
      <div>
      <Form method="post" onSubmit={handleSubmit}>
      <FormField
          name='comment'
          placeholder='Enter comment'
          type='textarea'
          rows={3}
          required={true}
          autoFocus={true}
          value={body}
          onChange={(ev) => {
            setBody(String(ev.target.value))
            return ev.target.value
          }}
          error={error}
          />

        <Button type="submit" onClick={handleSubmit} placeholder='Save' className="bg-red">Save</Button>
        {props.onCancel && (
          <button onClick={handleCancel} className="mt-2 text-sm underline ml-2">cancel</button>
        )}

      </Form>
      </div>
    </div>
  )
}
