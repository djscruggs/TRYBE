import { JSX } from 'react'
import ChatItem from './chatItem'
import type { Comment } from '~/utils/types'
import { useChatContext } from '~/contexts/ChatContext'

interface ChatContainerProps {
  date: string
  allowReplies?: boolean
  highlightedObject?: string
  highlightedId?: number | null
}

export default function ChatContainer (props: ChatContainerProps): JSX.Element {
  const { getCommentsByDate, deleteComment } = useChatContext()
  const comments = getCommentsByDate()[props.date] ?? []
  if (comments.length === 0) return <></>
  const afterDelete = (comment: Comment): void => {
    deleteComment(comment)
  }

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
