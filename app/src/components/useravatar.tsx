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
  
  if(!user) return <></>
  const name = user ? user.profile.firstName + ' ' + user.profile.lastName : 'Anonymous'
  return(
    <Avatar 
      src={user.profile.firstName == 'DJ' ? "/avatars/dj.jpeg" : "/avatars/tameem.jpeg"}
      alt={name}
      variant={variant}
      size={size} 
      color={color}
      className={className} 
      withBorder={withBorder} 
    />
  )  
}
export default UserAvatar;