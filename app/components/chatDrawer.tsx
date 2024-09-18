import React, { useState, useEffect, useRef } from 'react'
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
  type: 'post' | 'challenge' | 'checkin'
  id: number
  commentCount?: number
  comments?: Comment[]
  children: React.ReactNode

}

export default function ChatDrawer (props: ChatDrawerProps): JSX.Element {
  // Determine the type based on which ID is set
  const skeletonRows = props.commentCount ?? 0
  const { type, id } = props
  const { isOpen, placement, onClose, size, children } = props
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [comments, setComments] = useState<Comment[] | null>(props.comments ?? null)
  const [open, setOpen] = useState(false)
  const [firstComment, setFirstComment] = useState<Comment | null>(null)
  const [refresh, setRefresh] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const closeDrawer = (): void => {
    setOpen(false)
    onClose()
  }
  const afterSaveComment = (comment: Comment): void => {
    console.log('afterSave comment is', comment)
    if (firstComment?.id) {
      setComments([firstComment, ...(comments ?? [])])
    }
    const filteredComments = comments?.filter(comment => comment.id !== undefined)
    setComments(filteredComments ?? [])
    setFirstComment(comment)
    setRefresh(true)
  }
  const onPendingComment = (comment: Comment): void => {
    if (firstComment) {
      setComments([firstComment, ...(comments ?? [])])
    }
    console.log('onPending comment is', comment)
    setFirstComment(comment)
    setRefresh(true)
  }
  const onSaveCommentError = (error: Error): void => {
    setFirstComment(null)
    toast.error('Failed to send chat:' + String(error))
  }
  const [likedCommentIds, setLikedCommentIds] = useState<number[]>([])
  const fetchComments = async (): Promise<void> => {
    setIsLoading(true)
    const { data } = await axios.get<Comment[]>(`/api/comments/${type}/${id}`)
    setComments(data)
    setIsLoading(false)
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
          {children}

        </div>
        <div className='overflow-y-auto'>
          {isLoading
            ? <div className='p-2'>
                <ChatRowSkeleton count={skeletonRows} />
              </div>
            : <ChatContainer comments={comments ?? []} firstComment={firstComment} likedCommentIds={likedCommentIds} />
          }

          <div className='px-2' ref={bottomRef}>
            <FormChat afterSave={afterSaveComment} onPending={onPendingComment} onError={onSaveCommentError} objectId={id} type={type} inputRef={inputRef} />
          </div>
        </div>

      </Drawer>

  )
}
