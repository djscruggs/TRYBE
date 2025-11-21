import { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react'
import type { Comment } from '~/utils/types'
import type { ReactNode } from 'react'
import Pusher from 'pusher-js'
import { useCurrentUser } from '~/contexts/CurrentUserContext'
export interface ChatContextType {
  commentsByDate: Record<string, Comment[]>
  getCommentsByDate: () => Record<string, Comment[]>
  newComments: Comment[]
  pendingComments: Comment[]
  challengeId: number | null
  cohortId: number | null
  addComment: (comment: Comment) => void
  deleteComment: (comment: Comment) => void
}

const defaultValues: ChatContextType = {
  commentsByDate: {},
  getCommentsByDate: () => ({}),
  newComments: [],
  pendingComments: [],
  challengeId: null,
  cohortId: null,
  addComment: () => {},
  deleteComment: () => {}
}

const ChatContext = createContext<ChatContextType>(defaultValues)

interface ChatContextProviderProps {
  children: ReactNode
  challengeId: number | null
  cohortId: number | null
  commentsByDate: Record<string, Comment[]>
  onChange?: (commentsByDate: Record<string, Comment[]>) => void
}

export const ChatContextProvider = (props: ChatContextProviderProps) => {
  const { children, challengeId, cohortId } = props
  const { currentUser } = useCurrentUser()
  const [pendingComments, setPendingComments] = useState<Comment[]>([])
  const [commentsByDate, setCommentsByDate] = useState<Record<string, Comment[]>>(props.commentsByDate)
  const pusherRef = useRef<Pusher | null>(null)
  const channelRef = useRef<any>(null)

  // Memoize the merged comments so components re-render when dependencies change
  const mergedCommentsByDate = useMemo(() => {
    // deep copy commentsByDate to avoid mutating the original state
    const mergedComments = JSON.parse(JSON.stringify(commentsByDate))
    const key = new Date().toLocaleDateString('en-CA')
    const addedComments: number[] = []
    pendingComments.forEach(comment => {
      if (!addedComments.includes(comment.id as number)) {
        if (!mergedComments[key]) {
          mergedComments[key] = []
        }
        mergedComments[key].push(comment)
        addedComments.push(comment.id as number)
      }
    })
    return mergedComments
  }, [commentsByDate, pendingComments])

  useEffect(() => {
    if (pendingComments.length > 0) {
      props.onChange?.(mergedCommentsByDate)
    }
  }, [pendingComments, mergedCommentsByDate])

  // Connect to Pusher for real-time updates
  useEffect(() => {
    if (!challengeId || !cohortId) return

    // Only initialize Pusher on the client side
    if (typeof window === 'undefined') return

    // Get Pusher key from window.ENV (set by root loader)
    const pusherKey = (window as any).ENV?.PUSHER_KEY
    const pusherCluster = (window as any).ENV?.PUSHER_CLUSTER || 'us2'

    if (!pusherKey) {
      console.warn('Pusher key not found - real-time chat will not work')
      return
    }

    // Initialize Pusher client
    pusherRef.current = new Pusher(pusherKey, {
      cluster: pusherCluster,
      forceTLS: true
    })

    // Subscribe to the challenge chat channel
    const channelName = `chat-${challengeId}-${cohortId}`
    channelRef.current = pusherRef.current.subscribe(channelName)

    // Listen for new messages
    channelRef.current.bind('new-message', (comment: Comment) => {
      // Don't add messages from current user (already added optimistically)
      if (comment.userId !== currentUser?.id) {
        addIncomingMessage(comment)
      } else {
        // This is our own message confirmed from server
        // Replace the optimistic/pending version with the real one
        confirmOptimisticMessage(comment)
      }
    })

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        channelRef.current.unbind_all()
      }
      if (pusherRef.current) {
        pusherRef.current.unsubscribe(channelName)
        pusherRef.current.disconnect()
      }
    }
  }, [challengeId, cohortId, currentUser?.id])

  // Add incoming message from another user
  const addIncomingMessage = (comment: Comment) => {
    const key = new Date(comment.createdAt as unknown as string).toLocaleDateString('en-CA')
    setCommentsByDate(prev => {
      const updated = { ...prev }
      if (!updated[key]) {
        updated[key] = []
      }
      // Check if message already exists (avoid duplicates)
      const exists = updated[key].some(c => c.id === comment.id)
      if (!exists) {
        updated[key] = [...updated[key], comment]
      }
      return updated
    })
  }

  // Confirm optimistic message with real data from server
  const confirmOptimisticMessage = (comment: Comment) => {
    // Remove from pending
    const hash = generateNumericIdFromString(comment.body)
    setPendingComments(prev => prev.filter(c => c.id !== hash))

    // Add confirmed message
    const key = new Date(comment.createdAt as unknown as string).toLocaleDateString('en-CA')
    setCommentsByDate(prev => {
      const updated = { ...prev }
      if (!updated[key]) {
        updated[key] = []
      }
      // Check if message already exists
      const exists = updated[key].some(c => c.id === comment.id)
      if (!exists) {
        updated[key] = [...updated[key], comment]
      }
      return updated
    })
  }

  function generateNumericIdFromString (str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash |= 0 // Convert to 32bit integer
    }
    return Math.abs(hash) // Ensure the ID is positive
  }

  const getCommentsByDate = (): Record<string, Comment[]> => {
    return mergedCommentsByDate
  }

  const addComment = (comment: Comment): void => {
    const hash = generateNumericIdFromString(comment.body)
    const key = new Date(comment.createdAt as unknown as string).toLocaleDateString('en-CA')
    if (!comment.id) {
      comment.id = hash
      const newPendingComments = [...pendingComments, comment]
      setPendingComments(newPendingComments)
    } else {
      const newPendingComments = pendingComments.filter(pendingComment => pendingComment.id !== hash)
      setPendingComments(newPendingComments)
      const newCommentsByDate = { ...commentsByDate }
      if (!newCommentsByDate[key]) {
        newCommentsByDate[key] = []
      }
      newCommentsByDate[key].push(comment)
      setCommentsByDate(newCommentsByDate)
    }
  }

  const deleteComment = (comment: Comment): void => {
    const key = new Date(comment.createdAt as unknown as string).toLocaleDateString('en-CA')
    const newCommentsByDate = { ...commentsByDate }
    if (newCommentsByDate[key]) {
      newCommentsByDate[key] = newCommentsByDate[key].filter(c => c.id !== comment.id)
    }
    setCommentsByDate(newCommentsByDate)
  }

  return (
    <ChatContext.Provider value={{ commentsByDate: mergedCommentsByDate, getCommentsByDate, newComments: [], pendingComments, challengeId, cohortId, addComment, deleteComment }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within a ChatContextProvider')
  }
  return context
}
