import { useState, useEffect } from 'react'
import axios from 'axios'
import { Avatar } from '@material-tailwind/react'
import { Link } from '@remix-run/react'

interface AvatarLoaderProps {
  object: any
  marginClass?: string
  clickable?: boolean
}
export default function AvatarLoader ({ object, marginClass = '', clickable = false }: AvatarLoaderProps): JSX.Element {
  const [loading, setLoading] = useState(!object.user?.profile)
  const [profile, setProfile] = useState(object.user?.profile)
  useEffect(() => {
    if (!profile) {
      setLoading(true)
      axios.get(`/api/users/${note.userId}`)
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
  }, [object.userId])
  if (loading) {
    return <div className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center mr-8 flex-shrink-0 flex-grow-0">

    </div>
  }

  const avatarImg = profile?.profileImage ? `${profile.profileImage}?${Date.now()}` : ''
  if (avatarImg) {
    if (clickable) {
      return <Link to={`/members/${object.userId}`}><Avatar src={avatarImg} className={`w-12 h-12 ${marginClass}`}/></Link>
    } else {
      return <Avatar src={avatarImg} className={`w-12 h-12 ${marginClass}`}/>
    }
  }

  return (
      <div className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0 flex-grow-0">
        {loading || !profile?.firstName || !profile.lastName
          ? ''
          : <span className="text-white">{`${profile.firstName[0]}${profile.lastName[0]}`}</span>
        }
      </div>
  )
}
