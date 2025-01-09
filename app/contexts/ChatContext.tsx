import { createContext, useContext, useEffect, useState } from 'react'
import type { Comment } from '~/utils/types'
import type { ReactNode } from 'react'
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
  const [pendingComments, setPendingComments] = useState<Comment[]>([])
  const [commentsByDate, setCommentsByDate] = useState<Record<string, Comment[]>>(props.commentsByDate)
  useEffect(() => {
    if (pendingComments.length > 0) {
      props.onChange?.(getCommentsByDate())
    }
  }, [pendingComments])

  const getCommentsByDate = (): Record<string, Comment[]> => {
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
    function generateNumericIdFromString (str: string): number {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash |= 0 // Convert to 32bit integer
      }
      return Math.abs(hash) // Ensure the ID is positive
    }
  }

  const deleteComment = (comment: Comment): void => {
    const key = new Date(comment.createdAt as unknown as string).toLocaleDateString('en-CA')
    commentsByDate[key] = commentsByDate[key].filter(c => c.id !== comment.id)
  }

  return (
    <ChatContext.Provider value={{ commentsByDate, getCommentsByDate, newComments: [], pendingComments, challengeId, cohortId, addComment, deleteComment }}>
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
