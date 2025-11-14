import { Avatar } from '~/utils/material-tailwind';
import { useState, useEffect, JSX } from 'react'
import axios from 'axios'
import { Link } from 'react-router';
import { userInitials } from '~/utils/helpers'
interface AvatarLoaderProps {
  object: any
  marginClass?: string
  clickable?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  shape?: 'circle' | 'square'
}
export default function AvatarLoader ({ object, marginClass = '', clickable = false, size = 'md', shape = 'circle' }: AvatarLoaderProps): JSX.Element {
  const [loading, setLoading] = useState(!object.user?.profile)
  const [profile, setProfile] = useState(object.user?.profile)
  const initials = userInitials(object.user)
  useEffect(() => {
    if (!profile) {
      setLoading(true)
      axios.get(`/api/users/${object.userId}`)
        .then(res => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          setProfile(res.data.profile)
        })
        .catch(err => {
          console.error('error', err)
        }).finally(() => {
          setLoading(false)
        })
    }
  }, [])
  if (loading) {
    return <div className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center mr-8 flex-shrink-0 flex-grow-0">

    </div>
  }
  const avatarImg = profile?.profileImage ? profile.profileImage : ''
  if (avatarImg) {
    if (clickable) {
      return <Link to={`/members/${object.userId}/content`}>
        <Avatar src={avatarImg} size={size} className={`${marginClass}`}/>
      </Link>
    } else {
      return <Avatar src={avatarImg} size={size} className={`${marginClass} ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'}`}/>
    }
  }

  return (
      <div className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0 flex-grow-0 mr-2">
        {loading || !profile?.fullName
          ? ''
          : <span className="text-white">{initials}</span>
        }
      </div>
  )
}
