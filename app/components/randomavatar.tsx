import { Avatar } from "@material-tailwind/react";
import { CurrentUserContext } from '../utils/CurrentUserContext'

type UserAvatarProps = {
  variant?: string
  size?: string
  color?: string
  className?: string
  withBorder?: boolean
}
const RandomAvatar = ({ variant='circular', size='md', color='gray', className='', withBorder=false }: UserAvatarProps) => {
  const images = [
    'dj',
    'jigarr',
    'libby',
    'milly',
    'rocco',
    'tameem'
  ]
  const randomIndex = Math.floor(Math.random() * images.length);
  const chosen = '/avatars/' + images[randomIndex] + '.jpeg';
  return(
    <Avatar 
      src={chosen} 
      className={className} 
      variant={variant}
      size={size} 
      color={color}
      withBorder={withBorder} 
    />
  )  
}
export default RandomAvatar;