import ChatItem from './chatItem'
import type { Comment } from '~/utils/types'
import { useState, useEffect } from 'react'

interface CommentsProps {
  comments: Comment[]
  firstComment?: Comment | null
  likedCommentIds: number[]
}

export default function ChatContainer (props: CommentsProps): JSX.Element {
  const { comments, firstComment } = props
  const [likedCommentIds, setLikedCommentIds] = useState<number[]>([])
  useEffect(() => {
    setLikedCommentIds(props.likedCommentIds)
  }, [props.likedCommentIds])
  return (
    <div className='w-full' id='comments'>
      {firstComment &&
        <ChatItem key={`comment-${firstComment.id}`} comment={firstComment} likedCommentIds={likedCommentIds} />
      }
      {comments.map((comment) => {
        return (
          <ChatItem key={`comment-${comment.id}`} comment={comment} likedCommentIds={likedCommentIds} />
        )
      })}
    </div>
  )
}
