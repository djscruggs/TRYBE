import { HiOutlineQuestionMarkCircle } from 'react-icons/hi'
export const iconFiles: Record<string, number> = {
  'artist-brown.png': 150,
  'environment-brown.png': 150,
  'journal-black.png': 150,
  'journal-pink.png': 150,
  'meditate-black.png': 150,
  'meditate-brown.png': 150,
  'meditate-white.png': 150,
  'runner-pink.png': 150,
  'weights-black.png': 150,
  'yoga-black.png': 150,
  'yoga-white.png': 150
}
interface ChallengeIconProps {
  icon?: string
  size?: string
}
const ChallengeIcon = ({ icon, size }: ChallengeIconProps): JSX.Element => {
  let width = 150
  if (icon && iconFiles[icon]) {
    width = iconFiles[icon]
  }
  if (size === 'small') {
    width = Math.floor(width * 0.4)
  }
  return (
    <>
    {icon && icon.includes('png')
      ? (
        <img src={`/images/icons/${icon}?v=${Date.now()}`} width={width} className="cursor-pointer object-contain" />
        )
      : (
      <HiOutlineQuestionMarkCircle className="w-24 h-24 text-grey" />
        )}
    </>
  )
}
export default ChallengeIcon
