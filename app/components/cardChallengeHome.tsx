import { useContext, useState } from 'react'
import { FaRegCalendarAlt, FaUserFriends } from 'react-icons/fa'
import { type Challenge, type ChallengeSummary } from '~/utils/types'
import { colorToClassName } from '~/utils/helpers'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { useNavigate } from '@remix-run/react'
import { differenceInCalendarDays, differenceInWeeks, isPast } from 'date-fns'
import { getShortUrl } from '~/utils/helpers/challenge'
import ChallengeIcon from './challengeIcon'
import { CheckInButton } from './checkinButton'
import DialogShare from './dialogShare'
import { SlShareAlt } from 'react-icons/sl'
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
  const [sharing, setSharing] = useState(false)
  const isHost = challenge.userId === currentUser?.id
  const navigate = useNavigate()
  const bgColor = colorToClassName(challenge?.color ?? '', 'red')
  const memberCount = challenge?._count?.members ?? 0
  const expired = isPast(challenge.endAt ?? new Date('1970-01-01'))
  const started = !expired && challenge.startAt ? isPast(challenge.startAt) : false
  const checkInButtonDisabled = expired || !started || challenge.status === 'DRAFT'
  const goToChallenge = (event: any): void => {
    event.stopPropagation()
    if (isPreview ?? sharing) {
      return
    }
    let url = `/challenges/v/${challenge.id}/about`
    if (challenge.status === 'PUBLISHED') {
      if (isMember) {
        if (memberCount >= 2 || challenge.type === 'SCHEDULED') {
          url = `/challenges/v/${challenge.id}/chat`
        } else {
          url = `/challenges/v/${challenge.id}/checkins`
        }
      }
    }
    navigate(url)
  }
  let challengeLength = ''
  if (challenge.type === 'SCHEDULED') {
    if (challenge.frequency === 'WEEKLY') {
      challengeLength = differenceInWeeks(challenge.endAt ?? new Date('1970-01-01'), challenge.startAt ?? new Date('1970-01-01')) + 1 + ' wks'
    } else {
      challengeLength = differenceInCalendarDays(challenge.endAt ?? new Date('1970-01-01'), challenge.startAt ?? new Date('1970-01-01')) + 1 + ' days'
    }
  } else {
    challengeLength = challenge.numDays + ' days'
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
      if (expired) {
        return 'Ended'
      }

      // return 'Started ' + new Date(challenge.startAt).toLocaleDateString(currentUser?.locale ?? 'en-US', formatOptions)
      return 'In progress'
    }
  }

  const getShareUrl = (): string => {
    return `${window.location.origin}/challenges/v/${challenge.id}/about?i=1`
  }
  const categoryNames = challenge.categories?.map(category => category.name).filter((name): name is string => name !== undefined) ?? []
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
                    <SlShareAlt className="cursor-pointer text-grey text-sm mr-1 inline w-4 h-4 ml-2" onClick={(event) => { event?.stopPropagation(); setSharing(true) }}/>
                    <DialogShare
                      isOpen={sharing}
                      prompt='Copy this link to invite your friends'
                      link={getShortUrl(challenge)}
                      onClose={() => { setSharing(false) }}
                    />

                  </div>
                </div>
                {challenge.type === 'SELF_LED'
                  ? <>

                  <div className='text-xs text-darkgrey'>Self-Guided
                    <DraftBadge challenge={challenge} className='ml-2 inline' />
                    </div>
                  </>

                  : <>
                    <div className=''>

                      <FaUserFriends className='h-4 w-4 text-darkgrey inline' />
                      <span className='text-xs pl-2 text-darkgrey inline'>{memberCount} joined</span>
                      {!challenge.public &&
                        <span className='text-xs text-darkgrey ml-2'>Private</span>
                      }
                    </div>
                    <div className=''>
                      <FaRegCalendarAlt className='h-4 w-4 text-darkgrey inline' />
                      <span className='text-xs pl-1 text-darkgrey inline'>{howLongToStart()}</span>
                      <DraftBadge challenge={challenge} className='ml-2 inline' />
                    </div>
                  </>
                }
                {categoryNames.length > 0 &&
                  <div className='text-xs text-blue inline mr-1'>{categoryNames.join(', ')}</div>
                }

              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

function DraftBadge ({ challenge, className = '' }: { challenge: ChallengeSummary | Challenge, className?: string }): JSX.Element {
  if (challenge?.status === 'DRAFT') {
    return <div className={`text-sm font-bold text-yellow ${className}`}>Draft</div>
  }
  return <></>
}
