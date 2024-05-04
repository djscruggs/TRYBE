import CommentItem from './commentItem'
import type { Comment } from '~/utils/types'

interface CommentsProps {
  comments: Comment[]
  firstComment: Comment | null
  isReply: boolean
  likedCommentIds: number[]
}

export default function CommentsContainer (props: CommentsProps): JSX.Element {
  const { comments, firstComment, isReply, likedCommentIds } = props
  console.log(likedCommentIds)
  return (
    <div className={`max-w-sm md:max-w-lg ${isReply ? 'border-l-2' : ''}`} id='comments'>
      {firstComment &&
        <CommentItem key={`comment-${firstComment.id}`} comment={firstComment} isReply={isReply} likedCommentIds={likedCommentIds} />
      }
      {comments.map((comment) => {
        return (
          <CommentItem key={`comment-${comment.id}`} comment={comment} isReply={isReply} likedCommentIds={likedCommentIds} />
        )
      })}
    </div>
  )
}
