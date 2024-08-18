import CommentItem from './commentItem'
import type { Comment } from '~/utils/types'
import { useState, useEffect } from 'react'

interface CommentsProps {
  comments: Comment[]
  firstComment?: Comment | null
  isReply: boolean | undefined
  likedCommentIds: number[]
  allowReplies: boolean | undefined
}

export default function CommentsContainer (props: CommentsProps): JSX.Element {
  const { comments, firstComment, isReply } = props
  const [likedCommentIds, setLikedCommentIds] = useState<number[]>([])
  const allowReplies = typeof props.allowReplies === 'undefined' ? true : props.allowReplies
  useEffect(() => {
    setLikedCommentIds(props.likedCommentIds)
  }, [props.likedCommentIds])
  return (
    <div className={`max-w-sm md:max-w-lg ${isReply ? 'border-l-2' : ''}`} id='comments'>
      {firstComment &&
        <CommentItem key={`comment-${firstComment.id}`} comment={firstComment} isReply={isReply} allowReplies={allowReplies} likedCommentIds={likedCommentIds} />
      }
      {comments.map((comment) => {
        return (
          <CommentItem key={`comment-${comment.id}`} comment={comment} isReply={isReply} allowReplies={allowReplies} likedCommentIds={likedCommentIds} />
        )
      })}
    </div>
  )
}
