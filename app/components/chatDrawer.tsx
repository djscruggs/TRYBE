import React, { useState, useEffect, useRef } from 'react'
import { Drawer } from '@material-tailwind/react'
import ChatContainer from './chatContainer'
import type { Comment } from '~/utils/types'
import { toast } from 'react-hot-toast'
import FormChat from './formChat'
import { getIdAndType } from '~/utils/helpers'
import axios from 'axios'
interface CommentDrawerProps {
  isOpen: boolean
  placement: 'left' | 'right' | 'top' | 'bottom'
  onClose: () => void
  size: number
  comments: Comment[] | null
  children: React.ReactNode
  challengeId?: number
  postId?: number
  replyToId?: number
  threadId?: number
  checkInId?: number
}

export default function ChatDrawer (props: CommentDrawerProps): JSX.Element {
  // Determine the type based on which ID is set
  const { type, id } = getIdAndType(props)
  const { isOpen, placement, onClose, size, children } = props
  const bottomRef = useRef<HTMLDivElement>(null)
  const [comments, setComments] = useState<Comment[] | null>(null)
  const [open, setOpen] = useState(false)
  const [firstComment, setFirstComment] = useState<Comment | null>(null)
  const [refresh, setRefresh] = useState(false)
  const closeDrawer = (): void => {
    setOpen(false)
    onClose()
  }
  const afterSave = (comment: Comment): void => {
    if (firstComment) {
      setComments([firstComment, ...(comments ?? [])])
    }
    setFirstComment(comment)
    setRefresh(true)
  }
  const [likedCommentIds, setLikedCommentIds] = useState<number[]>([])
  const fetchComments = async (): Promise<void> => {
    const { data } = await axios.get<Comment[]>(`/api/comments/${type}/${id}`)
    setComments(data)
  }
  const fetchLikedCommentIds = async (): Promise<void> => {
    const { data } = await axios.get<number[]>(`/api/likes/${type}/${id}/comments`)
    setLikedCommentIds(data)
  }
  useEffect(() => {
    setOpen(isOpen)
    if (!isOpen) {
      onClose()
    } else {
      fetchComments().catch(error => {
        toast.error('Failed to fetch chat:' + String(error))
      })
      fetchLikedCommentIds().catch(error => {
        toast.error('Failed to fetch liked comments:' + String(error))
      })
    }
  }, [isOpen])
  // scroll to bottom of the page when the data changes
  useEffect(() => {
    if (isOpen || refresh) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      setRefresh(false)
    }
  }, [comments, isOpen, refresh])

  return (

      <Drawer open={open} placement={placement} onClose={closeDrawer} className="p-0 resize-x shadow-lg overflow-y-scroll" size={size} overlay={false}>

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
        <div className="pt-4 pb-2 flex items-center justify-between bg-gray-100">
          <div className='p-2'>
            {children}
          </div>
        </div>
        <div className='overflow-y-auto'>
          <ChatContainer comments={comments ?? []} firstComment={firstComment} likedCommentIds={likedCommentIds} />
          <div className='px-2' ref={bottomRef}>
            <FormChat afterSave={afterSave} checkInId={props.checkInId} postId={props.postId} challengeId={props.challengeId} replyToId={props.replyToId} threadId={props.threadId} />
          </div>
        </div>

      </Drawer>

  )
}
