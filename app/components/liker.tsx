import { TbHeartFilled } from 'react-icons/tb'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useUserLikes } from '~/hooks/useUserLikes'
interface LikerProps {
  itemId: number
  itemType: 'comment' | 'post' | 'note' | 'challenge' | 'thread' | 'checkin'
  count: number
  className?: string
}

export default function Liker (props: LikerProps): JSX.Element {
  const { itemId, itemType, className } = props
  const { hasLiked, like, unlike } = useUserLikes()
  const [isLiked, setIsLiked] = useState(hasLiked(itemType, itemId))
  const [count, setCount] = useState(props.count)

  const handleLike = async (): Promise<void> => {
    const tempIsLiked = isLiked
    const newIsLiked = !isLiked
    let newCount: number = newIsLiked ? count + 1 : count - 1
    if (newCount < 0) {
      newCount = 0
    }
    try {
      setIsLiked(newIsLiked)
      setCount(newCount)
      if (isLiked) {
        await unlike(itemType, itemId)
      } else {
        await like(itemType, itemId)
      }

      setCount(newCount)
    } catch (error) {
      toast.error('Error:' + error?.message)
      setIsLiked(tempIsLiked)
      setCount(newCount > 0 ? newCount - 1 : 0)
      console.error(error)
    }
  }

  return (
    <div className='text-xs'>
      <TbHeartFilled className={`h-4 w-4 mr-1 cursor-pointer text-sm inline ${isLiked ? 'text-red' : 'text-grey'} ${className}`} onClick={handleLike}/>
        {count}
    </div>
  )
}
