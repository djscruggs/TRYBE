import { Sheet, SheetContent, SheetHeader, SheetClose } from '~/components/ui/sheet';
import { Button } from './ui/button';
import React, { useState, useEffect, useRef, useCallback, useContext, JSX } from 'react'
import ChatContainer from './chatContainer'
import type { Comment } from '~/utils/types'
import { ChatRowSkeleton } from './skeletons'
import { toast } from 'react-hot-toast'
import FormChat from './formChat'
import axios from 'axios'
import { useShouldRefresh } from '~/hooks/useShouldRefresh'
import CommentContainer from './commentContainer'
interface ChatDrawerProps {
  isOpen: boolean
  placement: 'left' | 'right' | 'top' | 'bottom'
  onClose?: () => void
  onOpen?: () => void
  size: number
  type: 'post' | 'challenge' | 'checkin' | 'comment'
  id: number
  commentCount?: number
  comments?: Comment[]
  children: React.ReactNode
}

export default function ChatDrawer (props: ChatDrawerProps): JSX.Element {
  const { isOpen, placement, onClose, size, type, id, commentCount, children, onOpen } = props
  const skeletonRows = commentCount ?? 0
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [comments, setComments] = useState<Comment[]>(props.comments ?? [])
  const [open, setOpen] = useState(isOpen)
  const { setShouldRefresh } = useShouldRefresh()
  const [isLoading, setIsLoading] = useState(false)
  const closeDrawer = useCallback((): void => {
    setOpen(false)
    onClose?.()
    setShouldRefresh(true)
    document.body.classList.remove('overflow-hidden') // Enable body scroll
  }, [onClose])

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
  const afterSaveComment = (comment: Comment): void => {
    setComments([...comments, comment])
  }

  useEffect(() => {
    setOpen(isOpen)
    if (isOpen) {
      setShouldRefresh(false)
      void fetchComments()
      inputRef.current?.focus() // Focus the input when the drawer opens
    }
  }, [isOpen, fetchComments])

  useEffect(() => {
    if (isOpen) {
      onOpen?.()
    }
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [comments, isOpen, onOpen])

  const mouseEnter = useCallback((): void => {
    document.body.classList.add('overflow-hidden') // Disable body scroll
  }, [])

  const mouseLeave = useCallback((): void => {
    document.body.classList.remove('overflow-hidden') // Enable body scroll
  }, [])

  return (
    <Sheet open={open} onOpenChange={closeDrawer}  >
      
      <SheetContent className='bg-white p-0 border-2 [&>button:last-child]:hidden'>
        <SheetClose asChild>
            <span className='absolute right-2 p-1 top-1 cursor-pointer hover:bg-grey hover:text-white rounded-md'>

              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-x size-4 p-0" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
            </span>
          </SheetClose>
        <SheetHeader className='p-0'>
      
        <div className="p-2 pb-2 flex items-center justify-between bg-gray-100">
          {children}
        </div>
      </SheetHeader>
      <div className='overflow-y-auto'>
        {isLoading
          ? <ChatRowSkeleton count={skeletonRows} />
          : <CommentContainer comments={comments ?? []} />
        }
        {id &&
          <div className='px-2' ref={bottomRef}>
            <FormChat objectId={id} type={type} inputRef={inputRef} autoFocus={false} afterSave={afterSaveComment} />
          </div>
        }
      </div>
      </SheetContent>
    </Sheet>
  )
}
