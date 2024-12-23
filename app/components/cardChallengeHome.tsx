import { useContext } from 'react'
import { FaRegCalendarAlt, FaUserFriends } from 'react-icons/fa'
import { type ChallengeSummary } from '~/utils/types'
import { colorToClassName } from '~/utils/helpers'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { useNavigate } from '@remix-run/react'
import { differenceInCalendarDays, differenceInWeeks, differenceInBusinessDays, isPast } from 'date-fns'
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
  const isStarted = !isExpired && challenge.startAt ? isPast(challenge.startAt) : false
  const checkInButtonDisabled = isExpired || !isStarted
  const goToChallenge = (event: any): void => {
    event.stopPropagation()
    if (isPreview) {
      return
    }
    let url = `/challenges/v/${challenge.id}`
    if (isMember) {
      if (challenge.type === 'SCHEDULED') {
        url = `/challenges/v/${challenge.id}/chat`
      } else {
        url = `/challenges/v/${challenge.id}/checkins`
      }
    }
    navigate(url)
  }
  let challengeLength = ''
  if (challenge.frequency === 'WEEKLY') {
    challengeLength = differenceInWeeks(challenge.endAt ?? new Date('1970-01-01'), challenge.startAt ?? new Date('1970-01-01')) + ' wks'
  } else if (challenge.frequency === 'DAILY') {
    challengeLength = differenceInCalendarDays(challenge.endAt ?? new Date('1970-01-01'), challenge.startAt ?? new Date('1970-01-01')) + ' days'
  } else {
    challengeLength = differenceInBusinessDays(challenge.endAt ?? new Date('1970-01-01'), challenge.startAt ?? new Date('1970-01-01')) + ' days'
  }

  const howLongToStart = (): string => {
    if (!challenge.startAt || challenge.type === 'SELF_LED') {
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
                <div className={`relative border rounded-md p-2 pb-1 border-${bgColor}`}>
                {challengeLength !== '' &&
                    <div className="absolute -right-3 text-center -mt-5 capitalize p-1 px-2 rounded-md shadow-lg shadow-darkgrey w-[60px] bg-teal text-[0.6rem] text-white">{challengeLength}</div>

                }
                  <ChallengeIcon icon={challenge.icon as string | undefined} />
                </div>
              </div>
              <div className="w-4/5 border-0 mb-2 pt-2 pl-5">
                {isMember && !checkInButtonDisabled &&
                  <div onClick={(event) => { event.stopPropagation() }}>
                    <CheckInButton challenge={challenge} className={`shadow-lg shadow-darkgrey float-right w-fit bg-red hover:bg-green-500 text-white rounded-md p-2 justify-center text-xs italic disabled:bg-gray-400 ${checkInButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`} />
                  </div>
                }
                <div className='font-bold mb-1 text-start text-black'>

                  <div className='text-xs text-darkgrey flex items-center justify-start'>
                    <span className='text-black text-lg'>{challenge.name}</span>
                    {isHost &&
                      <> <span className='mx-2'>| </span> <span className='text-xs font-taprom text-blue'>Hosting</span></>
                    }
                    <ShareMenu className='ml-2' noText={true} copyUrl={getFullUrl()} itemType='challenge' itemId={Number(challenge.id)} isPreview={isPreview} />
                  </div>
                </div>
                {challenge.status === 'DRAFT' &&
                  <div className='text-xs text-yellow'>Draft</div>
                }
                {challenge.type === 'SELF_LED'
                  ? <div className='text-xs text-darkgrey'>Self-Guided</div>

                  : <>
                    <div className=''>
                      <FaUserFriends className='h-4 w-4 text-darkgrey inline' />
                      <span className='text-xs pl-2 text-darkgrey inline'>{memberCount} joined</span>
                    </div>
                  <div className=''>
                      <FaRegCalendarAlt className='h-4 w-4 text-darkgrey inline' />
                      <span className='text-xs pl-1 text-darkgrey inline'>{howLongToStart()}</span>
                    </div>
                  </>
                }
                {!challenge.public &&
                  <div className='text-xs text-darkgrey'>Private</div>
                }

              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
