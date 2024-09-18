import { TbHeartFilled } from 'react-icons/tb'
import { Spinner } from '@material-tailwind/react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'

interface LikerProps {
  isLiked: boolean
  itemId: number
  itemType: 'comment' | 'post' | 'note' | 'challenge' | 'thread' | 'checkIn'
  count: number
  className?: string
}

export default function Liker (props: LikerProps): JSX.Element {
  const { itemId, itemType, className } = props
  const [isLiked, setIsLiked] = useState(props.isLiked)
  const [count, setCount] = useState(props.count)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    setIsLiked(props.isLiked)
  }, [props.isLiked])
  const handleLike = async (): Promise<void> => {
    const tempIsLiked = isLiked
    let newCount: number = isLiked ? count - 1 : count + 1
    if (newCount < 0) {
      newCount = 0
    }
    setCount(newCount)
    setIsLiked(!isLiked)
    const formData = new FormData()
    if (itemType === 'comment') {
      formData.append('commentId', String(itemId))
    }
    if (itemType === 'post') {
      formData.append('postId', String(itemId))
    }
    if (itemType === 'note') {
      formData.append('noteId', String(itemId))
    }
    if (itemType === 'challenge') {
      formData.append('challengeId', String(itemId))
    }
    if (itemType === 'thread') {
      formData.append('threadId', String(itemId))
    }
    if (itemType === 'checkIn') {
      formData.append('checkinId', String(itemId))
    }
    if (isLiked) {
      formData.append('unlike', 'true')
    }
    setLoading(true)
    try {
      const response = await axios.post('/api/likes', formData)

      setCount(response.data?.totalLikes ? response.data?.totalLikes as number : newCount)
    } catch (error) {
      toast.error('Error:' + error?.message)
      setIsLiked(tempIsLiked)
      setCount(newCount > 0 ? newCount - 1 : 0)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='text-xs'>
      <TbHeartFilled className={`h-4 w-4 mr-1 cursor-pointer text-sm inline ${isLiked ? 'text-red' : 'text-grey'}`} onClick={handleLike}/>
        {count}
    </div>
  )
}
