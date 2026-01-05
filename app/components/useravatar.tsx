import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar'
import { CurrentUserContext } from '~/contexts/CurrentUserContext'
import React, { useContext } from 'react'
import { userInitials } from '~/utils/helpers'

interface UserAvatarProps {
  variant?: string
  size?: string
  color?: string
  className?: string
  withBorder?: boolean
}

const UserAvatar = ({
  variant = 'circular',
  size = 'md',
  color = 'gray',
  className = '',
  withBorder = false
}: UserAvatarProps) => {
  const { currentUser } = useContext(CurrentUserContext)
  if (!currentUser?.profile) return <></>
  const name = userInitials(currentUser) ?? '?'
  let src = currentUser.profile.profileImage
  if (src) {
    if (src.includes('?')) {
      src += `&t=${Date.now()}`
    } else {
      src += `?t=${Date.now()}`
    }
  }
  return (
    <Avatar className={className}>
      <AvatarImage src={src || undefined} alt={name} />
      <AvatarFallback>{name}</AvatarFallback>
    </Avatar>
  )
}
export default UserAvatar
