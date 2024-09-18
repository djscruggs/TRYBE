import React, { useState, useEffect, useRef } from 'react'
import { Drawer } from '@material-tailwind/react'
import ChatContainer from './chatContainer'
import type { Comment } from '~/utils/types'
import { toast } from 'react-hot-toast'
import FormChat from './formChat'
import axios from 'axios'
interface ChatDrawerProps {
  isOpen: boolean
  placement: 'left' | 'right' | 'top' | 'bottom'
  onClose: () => void
  size: number
  type: 'post' | 'challenge' | 'checkin'
  id: number
  comments?: Comment[]
  children: React.ReactNode

}

export default function ChatDrawer (props: ChatDrawerProps): JSX.Element {
  // Determine the type based on which ID is set
  const { type, id } = props
  const { isOpen, placement, onClose, size, children } = props
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [comments, setComments] = useState<Comment[] | null>(props.comments ?? null)
  const [open, setOpen] = useState(false)
  const [firstComment, setFirstComment] = useState<Comment | null>(null)
  const [refresh, setRefresh] = useState(false)
  const closeDrawer = (): void => {
    setOpen(false)
    onClose()
  }
  const [pendingComment, setPendingComment] = useState(false)
  const afterSave = (comment: Comment): void => {
    if (firstComment && !pendingComment) {
      setComments([firstComment, ...(comments ?? [])])
    }
    if (!comment.id) {
      setPendingComment(true)
      setFirstComment(comment)
    } else {
      setPendingComment(false)
    }
    setRefresh(true)
  }
  const onFormError = (error: Error): void => {
    if (pendingComment) {
      setFirstComment(null)
      setPendingComment(false)
    }
    toast.error('Failed to save comment:' + String(error))
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
      inputRef.current?.focus() // Focus the input when the drawer opens
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
            <FormChat afterSave={afterSave} afterCommit={afterSave} onError={onFormError} objectId={id} type={type} inputRef={inputRef} />
          </div>
        </div>

      </Drawer>

  )
}
