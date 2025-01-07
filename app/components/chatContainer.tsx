import ChatItem from './chatItem'
import type { Comment } from '~/utils/types'
import { useState, useEffect } from 'react'
interface ChatContainerProps {
  comments: Comment[]
  newestComment?: Comment | null
  allowReplies?: boolean
  highlightedObject?: string
  highlightedId?: number | null
}

export default function ChatContainer (props: ChatContainerProps): JSX.Element {
  const { comments: initialComments, newestComment: initialNewestComment, allowReplies } = props
  const [comments, setComments] = useState(initialComments)
  const [newestComment, setNewestComment] = useState<Comment | null>(initialNewestComment ?? null)
  useEffect(() => {
    setNewestComment(initialNewestComment ?? null)
    setComments(initialComments ?? [])
  }, [props])
  function cleanComments (comments: Comment[] | Record<string, Comment[]>) {
    if (Array.isArray(comments)) {
      return comments.filter(item => item !== null).map(cleanComments)
    } else if (typeof comments === 'object' && comments !== null) {
      return Object.fromEntries(
        Object.entries(comments)
          .map(([key, value]) => [key, cleanComments(value)])
          .filter(([_, value]) => value !== null && !(Array.isArray(value) && value.length === 0))
      )
    }
    // console.log('cleaned comments', comments)
    return comments
  }
  function getUniqueComments (): Comment[] {
    // console.log('comments in getUniqueComments', comments)
    const cleanedComments = cleanComments(comments)
    const uniqueIds = new Set(cleanedComments.map(comment => comment?.id))
    const uniqueComments = Array.from(uniqueIds).map(id => cleanedComments.find(comment => comment.id === id))
    return uniqueComments.filter(Boolean).sort((a, b) => new Date(a!.createdAt).getTime() - new Date(b!.createdAt).getTime()) as Comment[]
  }

  return (
    <div className='w-full' id='comments'>
      {getUniqueComments().map(comment => (
        <ChatItem key={`comment-${comment.id}`} highlightedObject={props.highlightedObject} highlightedId={props.highlightedId} comment={comment} allowReply={allowReplies} />
      ))}
      {newestComment && (
        <ChatItem key={`comment-${newestComment.id}`} highlightedObject={props.highlightedObject} highlightedId={props.highlightedId} comment={newestComment} allowReply={allowReplies} />
      )}
    </div>
  )
}
