import { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { CurrentUserContext } from '~/contexts/CurrentUserContext'
import { toast } from 'react-hot-toast'
interface UserLikes {
  post?: number[]
  comment?: number[]
  thread?: number[]
  checkin?: number[]
  note?: number[]
  message?: number[]
  challenge?: number[]
}

type LikeableType =
  | 'post'
  | 'comment'
  | 'note'
  | 'challenge'
  | 'thread'
  | 'checkin'
  | 'note'
  | 'message'

const useUserLikes = (): {
  hasLiked: (type: LikeableType, id: number) => boolean
  like: (type: LikeableType, id: number) => Promise<void>
  unlike: (type: LikeableType, id: number) => Promise<void>
} => {
  const { currentUser } = useContext(CurrentUserContext)
  const userId = currentUser?.id

  if (!currentUser) {
    return {
      hasLiked: () => false,
      like: async () => {},
      unlike: async () => {}
    }
  }

  const [likes, setLikes] = useState<UserLikes>({})

  const fetchLikes = async (): Promise<void> => {
    try {
      const { data } = await axios.get<UserLikes>(`/api/users/${userId}/likes`)
      setLikes(data)
      if (localStorage) {
        localStorage.setItem('userLikes', JSON.stringify(data)) // Update local storage
      }
    } catch (error) {
      console.error('Failed to fetch user likes:', error)
    }
  }

  useEffect(() => {
    if (localStorage) {
      const storedLikes = localStorage.getItem('userLikes')
      if (!storedLikes) {
        void fetchLikes()
      }
    }
  }, [userId])

  const hasLiked = (type: LikeableType, id: number): boolean => {
    return likes[type]?.includes(id) ?? false
  }

  const like = async (type: LikeableType, id: number): Promise<void> => {
    await postLike(type, id, false)
  }

  const unlike = async (type: LikeableType, id: number): Promise<void> => {
    await postLike(type, id, true)
  }

  const postLike = async (
    type: LikeableType,
    id: number,
    unlike: boolean = false
  ): Promise<void> => {
    const updatedLikes: Record<LikeableType, number[]> = { ...likes }

    if (!updatedLikes[type]) {
      updatedLikes[type] = []
    }

    if (unlike) {
      updatedLikes[type] = updatedLikes[type].filter((likeId) => likeId !== id)
    } else {
      if (!updatedLikes[type].includes(id)) {
        updatedLikes[type].push(id)
      }
    }

    setLikes(updatedLikes)
    if (localStorage) {
      localStorage.setItem('userLikes', JSON.stringify(updatedLikes))
    } // Update local storage

    const formData = new FormData()
    const _type = type.toLowerCase()
    if (_type === 'comment') {
      formData.append('commentId', String(id))
    }
    if (_type === 'post') {
      formData.append('postId', String(id))
    }
    if (_type === 'note') {
      formData.append('noteId', String(id))
    }
    if (_type === 'challenge') {
      formData.append('challengeId', String(id))
    }
    if (_type === 'thread') {
      formData.append('threadId', String(id))
    }
    if (_type === 'checkin') {
      formData.append('checkinId', String(id))
    }
    if (unlike) {
      formData.append('unlike', 'true')
    }
    try {
      await axios.post('/api/likes', formData)
    } catch (error) {
      toast.error('Error:' + error?.message)
      console.error(error)
    }
  }

  useEffect(() => {
    if (localStorage) {
      localStorage.setItem('userLikes', JSON.stringify(likes))
    } // Sync likes to local storage on change
  }, [likes])

  return { hasLiked, like, unlike }
}

export default useUserLikes
