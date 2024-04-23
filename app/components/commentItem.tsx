import React, { useState, useContext } from 'react'
import FormComment from './formComment'
import { Avatar, Spinner } from '@material-tailwind/react'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { convertlineTextToHtml } from '~/utils/helpers'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import type { Comment } from '~/utils/types'

interface CommentsProps {
  comment?: Comment | null
}

export default function CommentItem (props: CommentsProps): JSX.Element {
  const [comment, setComment] = useState<Comment | null>(props.comment ?? null)
  const [liking, setLiking] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const { currentUser } = useContext(CurrentUserContext)
  const handleEdit = (): void => {
    if (!comment || deleting) return
    setShowForm(true)
  }
  const handleDelete = async (): Promise<void> => {
    if (!comment) return
    setDeleting(true)
    try {
      const formData = new FormData()
      formData.append('id', comment.id.toString())
      formData.append('intent', 'delete')
      const response = await axios.post('/api/comments', formData)
      toast.success('Comment deleted')
      console.log(response)
      setComment(null)
    } catch (error) {
      toast.error('Error deleting comment')
      console.error(error)
    } finally {
      setDeleting(false)
    }
  }
  const afterSave = (comment: Comment): void => {
    // refresh comment after save
    setComment(comment)
    setShowForm(false)
  }
  if (!comment) return <></>
  return (
    <>
    {showForm
      ? (
      <FormComment afterSave={afterSave} onCancel={() => { setShowForm(false) }} comment={comment} />
        )
      : (
    <div className="w-full" key={`comment-${comment.id}`}>
      <div className='relative mb-2 p-2 border border-gray-200 break-all rounded-md even:bg-white odd:bg-gray-50'>
        {comment.user?.id === currentUser?.id &&
          <div className="text-xs text-gray-500 w-sm flex text-right justify-end absolute top-2 right-2">
            <span className='underline cursor-pointer mr-1' onClick={handleEdit}>edit</span>
            {deleting ? <Spinner className='h-4 w-4' /> : <span className='underline cursor-pointer mr-1' onClick={handleDelete}>delete</span>}
          </div>
        }
        <div className='flex'>
          <div className='flex-shrink-0'>
            <Avatar src={comment.user?.profile?.profileImage} className='mr-2' size='sm'/>
          </div>
          <div className='flex-grow'>
          <div className='text-xs mb-2'>{comment.user?.profile?.firstName} {comment.user?.profile?.lastName}</div>
            <div> {convertlineTextToHtml(comment.body)}</div>
          </div>
        </div>
      </div>
    </div>
        )
  }
  </>
  )
}
