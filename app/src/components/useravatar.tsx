import { Avatar } from "@material-tailwind/react";
import {UserContext} from '../utils/usercontext'
import { useContext } from 'react';

type UserAvatarProps = {
  variant?: string
  size?: string
  color?: string
  className?: string
  withBorder?: boolean
}
const UserAvatar = ({ variant='circular', size='md', color='gray', className='', withBorder=false }: UserAvatarProps) => {
  const user = useContext(UserContext)
  const name = user.profile.firstName + ' ' + user.profile.lastName
  return(
    <Avatar 
      src="/avatars/dj.jpeg" 
      alt={name}
      className={className} 
      variant={variant}
      size={size} 
      color={color}
      className={className} 
      withBorder={withBorder} 
    />
  )  
}
export default UserAvatar;