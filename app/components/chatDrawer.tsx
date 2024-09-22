import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Drawer } from '@material-tailwind/react'
import ChatContainer from './chatContainer'
import type { Comment } from '~/utils/types'
import { ChatRowSkeleton } from './skeletons'
import { toast } from 'react-hot-toast'
import FormChat from './formChat'
import axios from 'axios'

interface ChatDrawerProps {
  isOpen: boolean
  placement: 'left' | 'right' | 'top' | 'bottom'
  onClose: () => void
  size: number
  type: 'post' | 'challenge' | 'checkin' | 'comment'
  id: number
  commentCount?: number
  comments?: Comment[]
  children: React.ReactNode
}

export default function ChatDrawer (props: ChatDrawerProps): JSX.Element {
  const { isOpen, placement, onClose, size, type, id, commentCount, comments: initialComments, children } = props
  const skeletonRows = commentCount ?? 0
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [comments, setComments] = useState<Comment[] | null>(initialComments ?? null)
  const [open, setOpen] = useState(isOpen)
  const [newestComment, setNewestComment] = useState<Comment | null>(null)
  const [refresh, setRefresh] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const closeDrawer = useCallback((): void => {
    setOpen(false)
    onClose()
    document.body.classList.remove('overflow-hidden') // Enable body scroll
  }, [onClose])

  // Memoize the function to avoid unnecessary re-renders of child components
  const afterSaveComment = useCallback((comment: Comment): void => {
    setComments(prevComments => {
      // Filter out comments without an id and prepend the new comment
      const filteredComments = prevComments?.filter(c => c.id !== undefined) ?? []
      return [comment, ...filteredComments]
    })
    setNewestComment(null)
    setRefresh(true)
  }, [])

  // this is used to immediately display the pending without waiting for the server
  const onPendingComment = useCallback((comment: Comment): void => {
    setNewestComment(comment)
    setRefresh(true)
  }, [])

  const onSaveCommentError = useCallback((error: Error): void => {
    setNewestComment(null)
    toast.error('Failed to send message:' + String(error))
  }, [])

  const fetchComments = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    try {
      const { data } = await axios.get<Comment[]>(`/api/comments/${type}/${id}`)
      setComments(data)
    } catch (error) {
      toast.error('Failed to fetch chat:' + String(error))
    } finally {
      setIsLoading(false)
    }
  }, [type, id])

  useEffect(() => {
    setOpen(isOpen)
    if (isOpen) {
      void fetchComments()
      inputRef.current?.focus() // Focus the input when the drawer opens
    } else {
      onClose()
    }
  }, [isOpen, fetchComments, onClose])

  useEffect(() => {
    if (isOpen || refresh) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      setRefresh(false)
    }
  }, [comments, isOpen, refresh])

  const mouseEnter = useCallback((): void => {
    document.body.classList.add('overflow-hidden') // Disable body scroll
  }, [])

  const mouseLeave = useCallback((): void => {
    document.body.classList.remove('overflow-hidden') // Enable body scroll
  }, [])

  return (
    <Drawer open={open} placement={placement} onMouseEnter={mouseEnter} onMouseLeave={mouseLeave} onClose={closeDrawer} className="p-0 resize-x shadow-lg overflow-y-scroll" size={size} overlay={false} >
      <div className="absolute top-2 right-2 cursor-pointer" onClick={closeDrawer}>
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
        {children}
      </div>
      <div className='overflow-y-auto'>
        {isLoading
          ? <ChatRowSkeleton count={skeletonRows} />
          : <ChatContainer comments={comments ?? []} newestComment={newestComment} allowReplies={false} />
        }
        {id &&
          <div className='px-2' ref={bottomRef}>
            <FormChat afterSave={afterSaveComment} onPending={onPendingComment} onError={onSaveCommentError} objectId={id} type={type} inputRef={inputRef} />
          </div>
        }
      </div>
    </Drawer>
  )
}
