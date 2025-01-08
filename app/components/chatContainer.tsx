import ChatItem from './chatItem'
import type { Comment } from '~/utils/types'
import { useState, useEffect } from 'react'

interface ChatContainerProps {
  comments: Comment[]
  pendingComments?: Comment[] | null
  allowReplies?: boolean
  highlightedObject?: string
  highlightedId?: number | null
}

export default function ChatContainer (props: ChatContainerProps): JSX.Element {
  const { comments: initialComments, pendingComments: initialPendingComments, allowReplies } = props
  const [comments, setComments] = useState(initialComments)
  const [pendingComments, setPendingComments] = useState<Comment[]>(initialPendingComments ?? [])

  useEffect(() => {
    setPendingComments(initialPendingComments ?? [])
    setComments(initialComments ?? [])
  }, [props])

  function getUniqueComments (): Comment[] {
    const uniqueIds = new Set(comments.map(comment => comment?.id))
    const uniqueComments = Array.from(uniqueIds).map(id => comments.find(comment => comment.id === id))
    return uniqueComments.filter(Boolean).sort((a, b) => new Date(a!.createdAt).getTime() - new Date(b!.createdAt).getTime()) as Comment[]
  }

  return (
    <div className='w-full' id='comments'>
      {getUniqueComments().map(comment => (
        <ChatItem key={`comment-${comment.id}`} highlightedObject={props.highlightedObject} highlightedId={props.highlightedId} comment={comment} allowReply={allowReplies} />
      ))}
      {pendingComments.map(comment => (
        <ChatItem key={`comment-${comment.id}`} highlightedObject={props.highlightedObject} highlightedId={props.highlightedId} comment={comment} allowReply={allowReplies} />
      ))}
    </div>
  )
}
