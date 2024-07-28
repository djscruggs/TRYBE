import { useContext } from 'react'
import {
  Card
} from '@material-tailwind/react'
import { FaRegComment, FaRegCalendarAlt, FaUserFriends } from 'react-icons/fa'
import { type ChallengeSummary } from '~/utils/types'
import { colorToClassName, resizeImageToFit } from '~/utils/helpers'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { Link, useNavigate } from '@remix-run/react'
import { differenceInCalendarDays, isPast } from 'date-fns'
import ShareMenu from './shareMenu'
import Liker from './liker'
import { HiOutlineQuestionMarkCircle } from 'react-icons/hi2'
interface CardChallengeProps {
  challenge: ChallengeSummary
  isShare?: boolean
  isMember?: boolean
  isLiked?: boolean
  isPreview?: boolean
}

export default function CardChallenge ({ challenge, isShare, isMember, isLiked, isPreview }: CardChallengeProps): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  // in some chases isMember is undefined but a members array is included; check to see if the currentUser is in the members array
  if (isMember === undefined) {
    isMember = challenge?.members?.some(member => member.userId === currentUser?.id)
  }
  const navigate = useNavigate()
  const bgColor = colorToClassName(challenge?.color ?? '', 'red')
  const memberCount = challenge?._count?.members ?? 0
  const isExpired = isPast(challenge.endAt ?? new Date('1970-01-01'))
  const challengeLength = differenceInCalendarDays(challenge.endAt ?? new Date('1970-01-01'), challenge.startAt ?? new Date('1970-01-01'))
  const goToChallenge = (event: any): void => {
    event.stopPropagation()
    if (isPreview) {
      return
    }
    const url = `/challenges/v/${challenge.id}`
    if (currentUser) {
      navigate(url)
    } else {
      localStorage.setItem('redirect', url)
      navigate('/signup')
    }
  }
  let shortDescription = ''
  if (challenge?.description) {
    shortDescription = challenge.description.length > 120 ? challenge.description.substring(0, 117) + '...' : challenge.description
  }
  const [imgWidth, imgHeight] = resizeImageToFit(challenge.coverPhotoMeta?.width as number, challenge.coverPhotoMeta?.height as number, 300)
  const howLongToStart = (): string => {
    if (!challenge.startAt) {
      return ''
    }
    const daysUntilStart = differenceInCalendarDays(challenge.startAt, new Date())
    const formatOptions = {
      month: 'short' as 'short',
      day: 'numeric' as 'numeric'
    }
    const startFormatted = new Date(challenge.startAt).toLocaleDateString(currentUser?.locale ?? 'en-US', formatOptions)
    if (daysUntilStart > 0) {
      if (daysUntilStart === 1) {
        return 'Starts tomorrow'
      }
      return `Starts ${startFormatted}`
    } else {
      if (isExpired) {
        return 'Ended'
      }

      return 'Started ' + new Date(challenge.startAt).toLocaleDateString(currentUser?.locale ?? 'en-US', formatOptions)
    }
  }
  const getFullUrl = (): string => {
    return `${window.location.origin}/challenges/v/${challenge.id}`
  }
  return (
    <div className="mt-2 drop-shadow-none mr-2 w-full cursor-pointer">

      <div className="drop-shadow-none ">
        <div className={'rounded-md p-1 bg-white relative'}>
          <Card onClick={goToChallenge} className={`md:col-span-2 bg-${bgColor}/02 p-2 py-4  drop-shadow-lg border border-${bgColor} rounded-md`}>
          {challengeLength > 0 &&
            <div className="relative">
              <div className="absolute right-0 -mt-[28px] text-center capitalize p-1 rounded-md drop-shadow-xl w-[90px] bg-teal text-xs text-white">{challengeLength} days</div>
            </div>
          }
          <div className={'font-bold mb-1 text-start text-black'}>
            {challenge.name}
          </div>
          <div className="w-full flex">
            <div className="w-3/5 border-0  h-24 max-h-24 mb-2">
              <div className="text-gray-400 mb-2 text-ellipsis ">
              {shortDescription}
              </div>

            </div>
            <div className="w-2/5 border-0 flex justify-center -mt-4">
              {challenge.icon
                ? <img src={`/images/icons/${challenge.icon}`} alt="icon" width="130" />
                : <HiOutlineQuestionMarkCircle className="w-24 h-24 text-grey" />
              }
            </div>

          </div>
          {!isShare &&
              <div className="absolute flex flex-col justify-center w-full bottom-1">
                <div className="flex justify-start items-center mt-2">
                  <FaUserFriends className='h-4 w-4 text-grey' />
                  <span className='text-xs pl-2 text-grey'>{memberCount} joined</span>
                  <FaRegCalendarAlt className='h-4 w-4 ml-2 text-grey' />
                  <span className='text-xs pl-1 text-grey'>{howLongToStart()}</span>
                  <div className='text-xs pl-1 text-grey'>
                    <ShareMenu copyUrl={getFullUrl()} itemType='challenge' itemId={Number(challenge.id)} isPreview={isPreview}/>
                  </div>
                </div>

              </div>
            }

          </Card>
        </div>
        {/* <span className="text-xs text-gray-500">2 hours ago</span> */}
      </div>
      {!isPreview && !isShare && challenge.public &&
      <>
        <div className="grid grid-cols-3 text-center py-2 cursor-pointer">
          <div className="flex justify-center items-center">
          <Link to={`/challenges/v/${challenge.id}/comments#comments`}>
            <FaRegComment className="text-grey mr-1 inline" />
            { challenge._count?.comments && <span className="text-xs">{challenge._count?.comments} comments</span>}
            </Link>
          </div>
          <div className="flex justify-center items-center cursor-pointer">
            <Liker isLiked={Boolean(isLiked)} itemId={Number(challenge.id)} itemType='challenge' count={challenge.likeCount}/>
          </div>
          <div className="flex justify-center items-center cursor-pointer">
            <ShareMenu copyUrl={getFullUrl()} itemType='challenge' itemId={Number(challenge.id)}/>
          </div>
        </div>
      </>
      }
    </div>
  )
}
