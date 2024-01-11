import { Avatar } from "@material-tailwind/react";
import { CurrentUserContext } from '../utils/CurrentUserContext'
import { useContext } from 'react';


type UserAvatarProps = {
  variant?: string
  size?: string
  color?: string
  className?: string
  withBorder?: boolean
}
const UserAvatar = ({ variant='circular', size='md', color='gray', className='', withBorder=false }: UserAvatarProps) => {
  const {currentUser, setCurrentUser} = useContext(CurrentUserContext)
  
  if(!currentUser) return <></>
  const name =currentUser ? currentUser.profile.firstName + ' ' +currentUser.profile.lastName : 'Anonymous'
  return(
    <Avatar 
      src={currentUser.profile.firstName == 'DJ' ? "/avatars/dj.jpeg" : "/avatars/tameem.jpeg"}
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