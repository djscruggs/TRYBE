import { useContext } from 'react'
import {
  Card,
  Button
} from '@material-tailwind/react'
import { GiShinyApple } from 'react-icons/gi'
import { FaRegComment, FaRegCalendarAlt, FaUserFriends, FaRegHeart } from 'react-icons/fa'
import { type ChallengeSummary } from '../utils/types'
import { colorToClassName, textColorFromContainer, getIconOptionsForColor, buttonColorFromContainer, resizeImageToFit } from '~/utils/helpers'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import { Link, useNavigate } from '@remix-run/react'
import { differenceInCalendarDays } from 'date-fns'
import ShareMenu from './shareMenu'

interface CardChallengeProps {
  challenge: ChallengeSummary
  isShare?: boolean
  isMember?: boolean
}

export default function CardChallenge ({ challenge, isShare, isMember }: CardChallengeProps): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  // in some chases isMember is undefined but a members array is included; check to see if the currentUser is in the members array
  if (isMember === undefined) {
    isMember = challenge?.members?.some(member => member.userId === currentUser?.id)
  }
  const navigate = useNavigate()
  const textColor = textColorFromContainer(challenge.color ?? '', 'white')
  const bgColor = colorToClassName(challenge.color ?? '', 'red')
  const buttonColor = buttonColorFromContainer(bgColor, 'white')
  const buttonTextColor = textColorFromContainer(buttonColor, 'red')
  const goToChallenge = (event: any): void => {
    event.stopPropagation()
    const url = `/challenges/v/${challenge.id}`
    if (currentUser) {
      navigate(url)
    } else {
      localStorage.setItem('redirect', url)
      navigate('/signup')
    }
  }
  const [imgWidth, imgHeight] = resizeImageToFit(challenge.coverPhotoMeta?.width as number, challenge.coverPhotoMeta?.height as number, 300)
  const howLongToStart = (): string => {
    if (!challenge.startAt) {
      return ''
    }
    const daysUntilStart = differenceInCalendarDays(challenge.startAt, new Date())
    if (daysUntilStart > 0) {
      if (daysUntilStart === 1) {
        return '1 day'
      }
      return `${daysUntilStart} days`
    } else {
      return 'Started'
    }
  }
  const getFullUrl = (): string => {
    return `${window.location.origin}/challenges/v/${challenge.id}`
  }
  const iconOptions: Record<string, JSX.Element> = getIconOptionsForColor(bgColor)
  return (
    <div className="mt-2 drop-shadow-none mr-2 w-full cursor-pointer">
      <div className="drop-shadow-none">
        <div className={'rounded-md p-1 bg-white'}>
          <Card onClick={goToChallenge} className={`md:col-span-2 bg-${bgColor} p-2 py-4 border-1 drop-shadow-lg border-gray rounded-md`}>
          <div className={`font-bold mb-4 text-center text-${textColor}`}>{challenge.name}</div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col justify-center items-center col-span-1">
                <div className={`bg-transparent border-2 border-${textColor} text-${textColor} rounded-full w-16 h-16 flex items-center justify-center `}>
                 {challenge.icon ? iconOptions[challenge.icon] : <GiShinyApple className={`text-${textColor} h-8 w-8`} />}
                </div>
                {!isShare && challenge._count &&
                <div className="flex justify-center items-center mt-2">
                  <FaRegCalendarAlt className={`text-${textColor} h-4 w-4 mr-1`} />
                  <span className={`text-${textColor} text-xs pr-4`}>{howLongToStart()}</span>
                  <FaUserFriends className={`text-${textColor} h-4 w-4`} />
                  <span className={`text-${textColor} text-xs pl-2`}>{challenge._count.members}</span>
                </div>
                }
              </div>
              <div className="flex flex-col items-center col-span-2">

                {challenge.coverPhotoMeta?.secure_url! && <img src={challenge.coverPhotoMeta?.secure_url} alt={`${challenge?.name} cover photo`} width={imgWidth} height={imgHeight} className={`max-w-full max-h-[${imgHeight}px]`} />}
                <Button onClick={goToChallenge} className={`bg-${buttonColor} text-${buttonTextColor} p-3 py-2 rounded-full mt-3`}>{isMember ? 'Check In' : 'Sign up!'}</Button>
              </div>
            </div>
          </Card>
        </div>
        {/* <span className="text-xs text-gray-500">2 hours ago</span> */}
      </div>
      {!isShare && challenge.public &&
      <>
        <div className="grid grid-cols-3 text-center py-2 cursor-pointer">
          <div className="flex justify-center items-center">
          <Link to={`/challenges/v/${challenge.id}/comments#comments`}>
            <FaRegComment className="text-grey mr-1 inline" />
            <span className="text-xs">{challenge._count.comments} comments</span>
            </Link>
          </div>
          <div className="flex justify-center items-center cursor-pointer">
            {/* Replace with the actual heart icon import */}
            <FaRegHeart className="text-grey text-sm mr-1" />
            <span className="text-xs" onClick={goToChallenge}>{challenge._count.likes} likes</span>
          </div>
          <div className="flex justify-center items-center cursor-pointer">
            <ShareMenu copyUrl={getFullUrl()} itemType='challenge' itemId={challenge.id}/>
          </div>
        </div>
      </>
      }
    </div>
  )
}
