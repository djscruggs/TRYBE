import CommentItem from './commentItem'
import type { Comment } from '~/utils/types'

interface CommentsProps {
  comments: Comment[]
  firstComment: Comment | null
}

export default function CommentsContainer (props: CommentsProps): JSX.Element {
  const { comments, firstComment } = props
  return (
    <div className="max-w-sm md:max-w-lg" id='comments'>
      {firstComment &&
        <CommentItem key={`comment-${firstComment.id}`} comment={firstComment} />
      }
      {comments.map((comment) => {
        return (
          <CommentItem key={`comment-${comment.id}`} comment={comment} />
        )
      })}
    </div>
  )
}
