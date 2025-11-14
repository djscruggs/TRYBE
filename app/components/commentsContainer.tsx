import CommentItem from './commentItem'
import type { Comment } from '~/utils/types'
import { useState, useEffect, JSX } from 'react'

interface CommentsProps {
  comments: Comment[]
  newestComment?: Comment | null
  isReply: boolean | undefined
  allowReplies: boolean | undefined
}

export default function CommentsContainer (props: CommentsProps): JSX.Element {
  const { comments, newestComment, isReply } = props
  const allowReplies = typeof props.allowReplies === 'undefined' ? true : props.allowReplies
  return (
    <div className={`max-w-sm md:max-w-lg ${isReply ? 'border-l-2' : ''}`} id='comments'>
      {newestComment &&
        <CommentItem key={`comment-${newestComment.id}`} comment={newestComment} isReply={isReply} allowReplies={allowReplies} />
      }
      {comments.map((comment) => {
        return (
          <CommentItem key={`comment-${comment.id}`} comment={comment} isReply={isReply} allowReplies={allowReplies} />
        )
      })}
    </div>
  )
}
