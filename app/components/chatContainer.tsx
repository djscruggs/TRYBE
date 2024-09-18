import ChatItem from './chatItem'
import type { Comment } from '~/utils/types'
import { useState, useEffect } from 'react'

interface CommentsProps {
  comments: Comment[]
  firstComment?: Comment | null
  likedCommentIds: number[]
}

export default function ChatContainer (props: CommentsProps): JSX.Element {
  const [comments, setComments] = useState<Comment[]>(props.comments)
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
          <ChatItem key={`comment-${comment.id}`} comment={comment} likedCommentIds={likedCommentIds} />
        )
      })}
      {firstComment &&
        <ChatItem key={`comment-${firstComment.id}`} comment={firstComment} likedCommentIds={likedCommentIds} />
      }
    </div>
  )
}
