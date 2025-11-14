import { JSX } from 'react'
import type { Comment, CheckIn, Post, Challenge } from '~/utils/types'
import { FaRegComment } from 'react-icons/fa'
interface Props {
  showCallback: (event: any) => void
  object: Comment | CheckIn | Post | Challenge
}

const CommentsIconWithCount = ({ object, showCallback }: Props): JSX.Element => {
  const count = 'replyCount' in object ? object.replyCount : object.commentCount
  const label = 'replyCount' in object ? 'replies' : 'comments'
  return (
    <span className="text-xs mr-4 cursor-pointer" onClick={() => { showCallback(true) }}>
      <FaRegComment className="text-grey h-4 w-4 mr-2 inline" />
      {count > 0 && `${count} ${label}`}
    </span>
  )
}
export default CommentsIconWithCount
