import React, { useState, useEffect } from 'react'
import { Drawer } from '@material-tailwind/react'
import CommentsContainer from './commentsContainer'
import type { Comment } from '~/utils/types'
import FormComment from './formComment'
import axios from 'axios'
interface CommentDrawerProps {
  isOpen: boolean
  placement: 'left' | 'right' | 'top' | 'bottom'
  onClose: () => void
  size: number
  comments: Comment[]
  children: React.ReactNode
  challengeId?: number
  postId?: number
  replyToId?: number
  threadId?: number
  checkInId?: number
}

export default function CommentDrawer (props: CommentDrawerProps): JSX.Element {
  const { isOpen, placement, onClose, size, children } = props
  const [comments, setComments] = useState<Comment[]>(props.comments ?? [])
  const [open, setOpen] = useState(false)
  const [firstComment, setFirstComment] = useState<Comment | null>(null)
  const closeDrawer = (): void => {
    setOpen(false)
    onClose()
  }
  const afterSave = (comment: Comment): void => {
    if (firstComment) {
      setComments([firstComment, ...comments])
    }
    setFirstComment(comment)
  }
  const [likedCommentIds, setLikedCommentIds] = useState<number[]>([])
  useEffect(() => {
    setOpen(isOpen)
    if (!isOpen) {
      onClose()
    }
  }, [isOpen])
  useEffect(() => {
    const fetchLikedComments = async () => {
      const { data } = await axios.get<number[]>(`/api/comments/checkin/${props.checkInId}/likes`)
      setLikedCommentIds(data)
    }
    if (open) {
      fetchLikedComments().catch(error => {
        console.error('Failed to fetch liked comments:', error)
      })
    }
  }, [open])
  return (
      <Drawer open={open} placement={placement} onClose={closeDrawer} className="p-0 shadow-lg" size={size} overlay={false}>
        <div className="absolute top-2 right-2 cursor-pointer " onClick={closeDrawer}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <div className="mb-6 pt-4 flex items-center justify-between bg-gray-100">
          <div className='p-4'>
            {children}
          </div>

        </div>
        <div className='p-4'>
          <CommentsContainer comments={comments} isReply={false} allowReplies={false} firstComment={firstComment} likedCommentIds={likedCommentIds} />
          <FormComment afterSave={afterSave} checkInId={props.checkInId} postId={props.postId} challengeId={props.challengeId} replyToId={props.replyToId} threadId={props.threadId} />
        </div>
      </Drawer>
  )
}
