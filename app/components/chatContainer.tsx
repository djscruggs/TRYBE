import ChatItem from './chatItem'
import type { Comment } from '~/utils/types'
import { useState, useEffect } from 'react'
interface ChatContainerProps {
  comments: Comment[]
  newestComment?: Comment | null
  allowReplies?: boolean
}

export default function ChatContainer (props: ChatContainerProps): JSX.Element {
  const { comments: initialComments, newestComment: initialNewestComment, allowReplies } = props
  const [comments, setComments] = useState(initialComments)
  const [newestComment, setNewestComment] = useState<Comment | null>(initialNewestComment ?? null)

  useEffect(() => {
    setNewestComment(initialNewestComment ?? null)
  }, [initialNewestComment])

  useEffect(() => {
    setComments(initialComments)
  }, [initialComments])

  function getUniqueComments (): Comment[] {
    const uniqueIds = new Set(comments.map(comment => comment.id))
    const uniqueComments = Array.from(uniqueIds).map(id => comments.find(comment => comment.id === id))
    return uniqueComments.filter(Boolean).sort((a, b) => new Date(a!.createdAt).getTime() - new Date(b!.createdAt).getTime()) as Comment[]
  }

  return (
    <div className='w-full' id='comments'>
      {getUniqueComments().map(comment => (
        <ChatItem key={`comment-${comment.id}`} comment={comment} allowReply={allowReplies} />
      ))}
      {newestComment && (
        <ChatItem key={`comment-${newestComment.id}`} comment={newestComment} allowReply={allowReplies} />
      )}
    </div>
  )
}
