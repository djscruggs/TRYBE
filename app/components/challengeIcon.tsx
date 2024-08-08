import { HiOutlineQuestionMarkCircle } from 'react-icons/hi'

export const iconFiles = [
  'YogaLight.png',
  'YogaDark.png',
  'WorkoutDark.png',
  'SelfCareHeart.png',
  'RunnerPink.png',
  'MuscleBrain.png',
  'MeditatorMedium.png',
  'MeditatorLight.png',
  'MeditatorDark.png',
  'JournalPink.png',
  'JournalDark.png',
  'EnvironmentMedium.png'
]
interface ChallengeIconProps {
  icon?: string
}
const ChallengeIcon = ({ icon }: ChallengeIconProps): JSX.Element => {
  return (
    <>
    {icon && icon.includes('png')
      ? (
        <img src={`/images/icons/${icon}`} width="150" className="cursor-pointer" />
        )
      : (
      <HiOutlineQuestionMarkCircle className="w-24 h-24 text-grey" />
        )}
    </>
  )
}
export default ChallengeIcon
