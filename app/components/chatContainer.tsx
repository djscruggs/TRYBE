import ChatItem from './chatItem'
import type { Comment } from '~/utils/types'
import { useState, useEffect } from 'react'

interface ChatContainerProps {
  comments: Comment[]
  firstComment?: Comment | null
  likedCommentIds: number[]
  allowReplies?: boolean
}

export default function ChatContainer (props: ChatContainerProps): JSX.Element {
  const [comments, setComments] = useState(props.comments)
  const { allowReplies } = props
  const [likedCommentIds, setLikedCommentIds] = useState<number[]>([])
  const [firstComment, setFirstComment] = useState<Comment | null>(props.firstComment ?? null)
  useEffect(() => {
    setLikedCommentIds(props.likedCommentIds)
  }, [props.likedCommentIds])
  useEffect(() => {
    setFirstComment(props.firstComment ?? null)
  }, [props.firstComment])
  useEffect(() => {
    setComments(props.comments)
  }, [props.comments])
  const uniqueComments = (): Comment[] => {
    const unique = Array.from(new Set(comments.map(comment => comment.id)))
      .map(id => comments.find(comment => comment.id === id))
      .sort((a, b) => (new Date(a?.createdAt ?? 0).getTime()) - (new Date(b?.createdAt ?? 0).getTime()))
    if (!unique) {
      return []
    }
    return unique as Comment[]
  }
  return (
    <div className='w-full' id='comments'>

      {uniqueComments().map((comment) => {
        return (
          <ChatItem key={`comment-${comment.id}`} comment={comment} likedCommentIds={likedCommentIds} allowReply={allowReplies} />
        )
      })}
      {firstComment &&
        <ChatItem key={`comment-${firstComment.id}`} comment={firstComment} likedCommentIds={likedCommentIds} allowReply={allowReplies} />
      }
    </div>
  )
}
