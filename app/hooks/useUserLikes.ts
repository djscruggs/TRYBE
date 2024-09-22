import { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
interface UserLikes {
  post?: number[]
  comment?: number[]
  thread?: number[]
  checkin?: number[]
}

type LikeableType = 'post' | 'comment' | 'note' | 'challenge' | 'thread' | 'checkin'

export function useUserLikes (): {
  hasLiked: (type: LikeableType, id: number) => boolean
  like: (type: LikeableType, id: number) => Promise<void>
  unlike: (type: LikeableType, id: number) => Promise<void>
} {
  const { currentUser } = useContext(CurrentUserContext)
  const userId = currentUser?.id

  if (!currentUser) {
    return {
      hasLiked: () => false,
      like: async () => {},
      unlike: async () => {}
    }
  }

  const [likes, setLikes] = useState<UserLikes>(() => {
    // Initialize state from local storage
    const storedLikes = localStorage.getItem('userLikes')
    return storedLikes ? JSON.parse(storedLikes) : {}
  })

  const fetchLikes = async () => {
    try {
      const { data } = await axios.get<UserLikes>(`/api/users/${userId}/likes`)
      setLikes(data)
      localStorage.setItem('userLikes', JSON.stringify(data)) // Update local storage
    } catch (error) {
      console.error('Failed to fetch user likes:', error)
    }
  }

  const hasLiked = (type: LikeableType, id: number): boolean => {
    return likes[type]?.includes(id) ?? false
  }

  const like = async (type: LikeableType, id: number): Promise<void> => {
    await postLike(type, id, false)
  }

  const unlike = async (type: LikeableType, id: number): Promise<void> => {
    await postLike(type, id, true)
  }

  const postLike = async (type: LikeableType, id: number, unlike: boolean = false): Promise<void> => {
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
    localStorage.setItem('userLikes', JSON.stringify(updatedLikes)) // Update local storage

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
      const response = await axios.post('/api/likes', formData)
    } catch (error) {
      toast.error('Error:' + error?.message)
      console.error(error)
    }
  }
  useEffect(() => {
    void fetchLikes()
  }, [userId])

  useEffect(() => {
    localStorage.setItem('userLikes', JSON.stringify(likes)) // Sync likes to local storage on change
  }, [likes])

  return { hasLiked, like, unlike }
}
