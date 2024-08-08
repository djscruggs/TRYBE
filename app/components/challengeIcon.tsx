import { HiOutlineQuestionMarkCircle } from 'react-icons/hi'

export const iconFiles: Record<string, number> = {
  'YogaLight.png': 150,
  'YogaDark.png': 150,
  'WorkoutDark.png': 150,
  'SelfCareHeart.png': 150,
  'RunnerPink.png': 150,
  'MuscleBrain.png': 150,
  'MeditatorMedium.png': 150,
  'MeditatorLight.png': 150,
  'MeditatorDark.png': 150,
  'JournalPink.png': 150,
  'JournalDark.png': 150,
  'EnvironmentMedium.png': 150
}
interface ChallengeIconProps {
  icon?: string
}
const ChallengeIcon = ({ icon }: ChallengeIconProps): JSX.Element => {
  let width = 150
  if (icon && iconFiles[icon]) {
    width = iconFiles[icon]
  }
  return (
    <>
    {icon && icon.includes('png')
      ? (
        <img src={`/images/icons/${icon}`} width={width} className="cursor-pointer" />
        )
      : (
      <HiOutlineQuestionMarkCircle className="w-24 h-24 text-grey" />
        )}
    </>
  )
}
export default ChallengeIcon
