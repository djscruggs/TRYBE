import { Avatar } from '@material-tailwind/react'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import React, { useContext } from 'react'
import type { AvatarProps } from '@material-tailwind/react'
import { userInitials } from '../utils/helpers'

const UserAvatar = ({ variant = 'circular', size = 'md', color = 'gray', className = '', withBorder = false }: AvatarProps) => {
  const { currentUser } = useContext(CurrentUserContext)
  if (!currentUser?.profile) return <></>
  const name = userInitials(currentUser) ?? '?'
  return (
    <Avatar
      src={currentUser.profile.profileImage}
      alt={name}
      variant={variant}
      size={size}
      color={color}
      className={className}
      withBorder={withBorder}
    />
  )
}
export default UserAvatar
