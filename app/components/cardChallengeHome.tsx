import { useContext } from 'react'
import { FaRegCalendarAlt, FaUserFriends } from 'react-icons/fa'
import { type ChallengeSummary } from '~/utils/types'
import { colorToClassName } from '~/utils/helpers'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { useNavigate } from '@remix-run/react'
import { differenceInCalendarDays, isPast } from 'date-fns'
import ShareMenu from './shareMenu'
import ChallengeIcon from './challengeIcon'
import { CheckInButton } from './checkinButton'
interface CardChallengeProps {
  challenge: ChallengeSummary
  isMember?: boolean
  isPreview?: boolean
}

export default function CardChallengeHome ({ challenge, isMember, isPreview }: CardChallengeProps): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  // in some chases isMember is undefined but a members array is included; check to see if the currentUser is in the members array
  if (isMember === undefined) {
    isMember = challenge?.members?.some(member => member.userId === currentUser?.id) ?? challenge.userId === currentUser?.id
  }
  const isHost = challenge.userId === currentUser?.id
  const navigate = useNavigate()
  const bgColor = colorToClassName(challenge?.color ?? '', 'red')
  const memberCount = challenge?._count?.members ?? 0
  const isExpired = isPast(challenge.endAt ?? new Date('1970-01-01'))
  const isStarted = challenge.startAt ? isPast(challenge.startAt) : false
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

      // return 'Started ' + new Date(challenge.startAt).toLocaleDateString(currentUser?.locale ?? 'en-US', formatOptions)
      return 'In progress'
    }
  }
  const getFullUrl = (): string => {
    return `${window.location.origin}/challenges/v/${challenge.id}`
  }
  return (
    <div className="mt-2 drop-shadow-none mr-2 w-full cursor-pointer">

      <div className="drop-shadow-none ">
        <div className={'p-1 bg-white relative'}>
          <div onClick={goToChallenge} className='md:col-span-2 rounded-xl'>
            <div className="w-full flex">
              <div className='w-1/5 flex items-center justify-center'>
                <div className={`border rounded-md border-${bgColor}`}>
                  <ChallengeIcon icon={challenge.icon as string | undefined} />
                </div>
              </div>
              <div className="w-4/5 border-0 mb-2 pt-2 pl-4">
                {isMember && isStarted &&
                  <div onClick={(event) => { event.stopPropagation() }}>
                    <CheckInButton challenge={challenge} className={`float-right w-fit bg-red hover:bg-green-500 text-white rounded-md p-1 justify-center text-xs disabled:bg-gray-400 ${isExpired ? 'opacity-50 cursor-not-allowed' : ''}`} />
                  </div>
                }
                <div className='font-bold mb-1 text-start text-black'>

                  <div className='text-xs text-grey flex items-center justify-start'>
                    <span className='text-black text-lg'>{challenge.name}</span>
                    {isHost &&
                      <> <span className='mx-2'>| </span> <span className='text-xs font-taprom text-blue'>Hosting</span></>
                    }
                    <ShareMenu className='ml-2' noText={true} copyUrl={getFullUrl()} itemType='challenge' itemId={Number(challenge.id)} isPreview={isPreview} />
                  </div>
                </div>

                <div className=''>
                  <FaUserFriends className='h-4 w-4 text-grey inline' />
                  <span className='text-xs pl-2 text-grey inline'>{memberCount} joined</span>
                </div>
                <div className=''>
                  <FaRegCalendarAlt className='h-4 w-4 text-grey inline' />
                  <span className='text-xs pl-1 text-grey inline'>{howLongToStart()}</span>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
