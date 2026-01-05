import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar'
import { CurrentUserContext } from '~/contexts/CurrentUserContext'

interface UserAvatarProps {
  variant?: string
  size?: string
  color?: string
  className?: string
  withBorder?: boolean
}
const RandomAvatar = ({
  variant = 'circular',
  size = 'md',
  color = 'gray',
  className = '',
  withBorder = false
}: UserAvatarProps) => {
  const images = ['dj', 'jigarr', 'libby', 'milly', 'rocco', 'tameem']
  // const randomIndex = Math.floor(Math.random() * images.length);
  const randomIndex = 1
  const chosen = '/avatars/' + images[randomIndex] + '.jpeg'
  return (
    <Avatar className={className}>
      <AvatarImage src={chosen} />
      <AvatarFallback>U</AvatarFallback>
    </Avatar>
  )
}
export default RandomAvatar
