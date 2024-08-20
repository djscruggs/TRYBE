import { HiOutlineQuestionMarkCircle } from 'react-icons/hi'
export const iconFiles: Record<string, number> = {
  'People-05.png': 150,
  'People-06.png': 150,
  'People-07.png': 150,
  'People-08.png': 150,
  'People-09.png': 150,
  'People-10.png': 150,
  'People-11.png': 150,
  'People-12.png': 150,
  'People-13.png': 150,
  'People-14.png': 150,
  'People-15.png': 150
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
