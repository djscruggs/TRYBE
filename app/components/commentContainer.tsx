import ChatItem from './chatItem'
import type { Comment } from '~/utils/types'
import { useEffect, useState, JSX } from 'react'

interface ChatContainerProps {
  allowReplies?: boolean
  highlightedObject?: string
  highlightedId?: number | null
  comments: Comment[]
}

export default function CommentContainer (props: ChatContainerProps): JSX.Element {
  const [comments, setComments] = useState<Comment[]>(props.comments)
  const afterDelete = (comment: Comment): void => {
    setComments(comments.filter(c => c.id !== comment.id))
  }
  useEffect(() => {
    setComments(props.comments)
  }, [props.comments])
  return (
    <div className='w-full' id='comments'>
      {comments.map(comment => (
        <ChatItem
          key={`comment-${comment.id}`}
          highlightedObject={props.highlightedObject}
          highlightedId={props.highlightedId}
          comment={comment}
          allowReply={props.allowReplies}
          onDelete={afterDelete}
          />
      ))}
    </div>
  )
}
