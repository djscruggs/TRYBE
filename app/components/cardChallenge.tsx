import { useContext } from 'react'
import {
  Card
} from '@material-tailwind/react'
import { FaRegCalendarAlt, FaUserFriends } from 'react-icons/fa'
import { type ChallengeSummary } from '~/utils/types'
import { colorToClassName, resizeImageToFit, textToJSX } from '~/utils/helpers'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { useNavigate } from '@remix-run/react'
import { differenceInCalendarDays, differenceInWeeks, differenceInBusinessDays, isPast } from 'date-fns'
import ShareMenu from './shareMenu'
import ChallengeIcon from './challengeIcon'
import useGatedNavigate from '~/hooks/useGatedNavigate'
interface CardChallengeProps {
  challenge: ChallengeSummary
  isShare?: boolean
  isMember?: boolean
  isPreview?: boolean
}

export default function CardChallenge ({ challenge, isShare, isMember, isPreview }: CardChallengeProps): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  // in some chases isMember is undefined but a members array is included; check to see if the currentUser is in the members array
  if (isMember === undefined) {
    isMember = challenge?.members?.some(member => member.userId === currentUser?.id)
  }
  const navigate = useGatedNavigate()
  const bgColor = colorToClassName(challenge?.color ?? '', 'red')
  const memberCount = challenge?._count?.members ?? 0
  const expired = isPast(challenge.endAt ?? new Date('1970-01-01'))
  let challengeLength = ''
  if (challenge.frequency === 'WEEKLY') {
    challengeLength = differenceInWeeks(challenge.endAt ?? new Date('1970-01-01'), challenge.startAt ?? new Date('1970-01-01')) + ' weeks'
  } else if (challenge.frequency === 'DAILY') {
    challengeLength = differenceInCalendarDays(challenge.endAt ?? new Date('1970-01-01'), challenge.startAt ?? new Date('1970-01-01')) + ' days'
  } else {
    challengeLength = differenceInBusinessDays(challenge.endAt ?? new Date('1970-01-01'), challenge.startAt ?? new Date('1970-01-01')) + ' days'
  }
  const goToChallenge = (event: any): void => {
    event.stopPropagation()
    if (isPreview) {
      return
    }
    const url = `/challenges/v/${challenge.id}`
    navigate(url, true)
  }
  let shortDescription = ''
  if (challenge?.description) {
    shortDescription = challenge.description.length > 80 ? challenge.description.substring(0, 77) + '...' : challenge.description
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
      if (expired) {
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
        <div className={'p-1 bg-white relative'}>
          <Card onClick={goToChallenge} className={`md:col-span-2 bg-${bgColor} bg-opacity-02 p-2 pt-5 pl-5 pb-6 pr-2 drop-shadow-lg border border-${bgColor} border-2 rounded-xl`}>
          {challengeLength !== '' &&
            <div className="relative">
              <div className="absolute right-2 -mt-[32px] text-center capitalize p-1 rounded-md drop-shadow-xl w-[90px] bg-teal text-xs text-white">{challengeLength}</div>
            </div>
          }
          <div className={'font-bold mb-1 text-start text-black'}>
            {challenge.name}
          </div>
          <div className="w-full flex">
            <div className="w-3/5 border-0  h-24 max-h-24 mb-2">
              <div className="text-gray-400 mb-2 text-ellipsis ">
              {textToJSX(shortDescription, true)}
              </div>

            </div>
            <div className="w-2/5 border-0 flex items-center justify-center -mt-4">
              <ChallengeIcon icon={challenge.icon as string | undefined} />
            </div>

          </div>

              <div className="absolute flex flex-col justify-center w-full bottom-4">
                <div className="flex justify-start items-center mt-2">
                  <FaUserFriends className='h-4 w-4 text-grey' />
                  <span className='text-xs pl-2 text-grey'>{memberCount} joined</span>
                  <FaRegCalendarAlt className='h-4 w-4 ml-2 text-grey' />
                  <span className='text-xs pl-1 text-grey'>{howLongToStart()}</span>
                  <div className='text-xs pl-1 text-grey'>
                  {!isShare &&
                    <ShareMenu copyUrl={getFullUrl()} itemType='challenge' itemId={Number(challenge.id)} isPreview={isPreview}/>
                  }
                  </div>
                </div>

              </div>

          </Card>
        </div>
      </div>

    </div>
  )
}
