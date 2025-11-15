import { useContext, JSX } from 'react'
import { FaRegCalendarAlt, FaUserFriends } from 'react-icons/fa'
import { type MemberChallenge, type Challenge, type ChallengeSummary } from '~/utils/types'
import { colorToClassName } from '~/utils/helpers'
import { CurrentUserContext } from '~/contexts/CurrentUserContext'
import { useNavigate } from 'react-router';
import { differenceInCalendarDays, differenceInWeeks } from 'date-fns'
import { getShortUrl, hasStarted, isExpired } from '~/utils/helpers/challenge'
import ChallengeIcon from './challengeIcon'
import { CheckInButton } from './checkinButton'
import { SlShareAlt } from 'react-icons/sl'
import { toast } from 'react-hot-toast'
interface CardChallengeProps {
  challenge: ChallengeSummary
  isMember?: boolean
  membership?: MemberChallenge
  isPreview?: boolean
}

export default function CardChallengeHome ({ challenge, isMember, isPreview, membership }: CardChallengeProps): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  // in some chases isMember is undefined but a members array is included; check to see if the currentUser is in the members array
  if (isMember === undefined) {
    isMember = challenge?.members?.some(member => member.userId === currentUser?.id) ?? (challenge.type === 'SCHEDULED' && challenge.userId === currentUser?.id)
  }
  const showHostLabel = (challenge.userId === currentUser?.id) && challenge.status !== 'DRAFT'
  const navigate = useNavigate()
  const bgColor = colorToClassName(challenge?.color ?? '', 'red')
  const memberCount = challenge?._count?.members ?? 0
  const expired = isExpired(challenge, membership)
  const started = hasStarted(challenge, membership)
  const checkInButtonDisabled = expired || !started || challenge.status === 'DRAFT'
  const goToChallenge = (event: any): void => {
    event.stopPropagation()
    if (isPreview) {
      return
    }
    let url = `/challenges/v/${challenge.id}/about`
    if (challenge.status === 'PUBLISHED') {
      if (isMember && started && !expired) {
        if (memberCount >= 2 || challenge.type === 'SCHEDULED') {
          url = `/challenges/v/${challenge.id}/chat`
        } else {
          url = `/challenges/v/${challenge.id}/checkins`
        }
        if (membership?.cohortId) {
          url += `/${membership.cohortId}`
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
  const copyLink = async (event: any): Promise<void> => {
    event.stopPropagation()
    await navigator.clipboard.writeText(getShortUrl(challenge, membership))
    toast.success('Link copied to clipboard')
  }

  const categoryNames = challenge.categories?.map(category => category.name).filter((name): name is string => name !== undefined) ?? []
  return (
    <div className="mt-2 drop-shadow-none mr-2 w-full cursor-pointer">

      <div className="drop-shadow-none ">
        <div className={'p-1 bg-white relative'}>
          <div onClick={goToChallenge} className='md:col-span-2 rounded-xl'>
            <div className="w-full flex">
              <div className='w-1/5 flex items-center justify-center'>
                <div className={`relative border rounded-md p-2 pb-1 h-[70px] w-[73px] md:h-[95px] md:w-[99px] border-${bgColor}`}>
                {challengeLength !== '' &&
                    <div className="absolute -right-3 text-center -mt-5 capitalize p-1 px-2 rounded-md shadow-lg shadow-darkgrey w-[60px] bg-teal text-[0.6rem] text-white">{challengeLength}</div>

                }
                  <ChallengeIcon icon={challenge.icon as string | undefined} />
                </div>
              </div>
              <div className="w-4/5 mb-2 pl-5">

                <div className='font-bold mb-1 text-start text-black'>

                  <div className='text-xs text-darkgrey flex items-start justify-start'>
                    <span className='text-black text-sm md:text-lg'>{challenge.name}</span>

                  </div>
                </div>
                <div className='flex w-full'>
                <div className='flex items-center justify-start w-2/3 text-xs md:text-sm'>
                  <div className = 'w-2/3'>

                    {challenge.type === 'SELF_LED' &&
                      <div className='text-xs text-darkgrey w-full'>Self-Guided
                        <DraftBadge challenge={challenge} className='ml-2 inline' />
                        {showHostLabel &&
                          <span className='text-xs font-taprom text-blue ml-2 inline'>Hosting</span>
                        }
                      </div>
                    }

                    {challenge.type !== 'SELF_LED' &&
                    <>
                        <div className=''>
                          <FaRegCalendarAlt className='h-4 w-4 text-darkgrey inline' />
                          <span className='text-xs pl-1 text-darkgrey inline'>{howLongToStart()}</span>
                          <DraftBadge challenge={challenge} className='ml-2 inline' />
                          {showHostLabel &&
                            <span className='text-xs font-taprom text-blue ml-2'>Hosting</span>
                          }

                        </div>
                        <div className=''>
                          {memberCount > 0 &&
                            <>
                              <FaUserFriends className='h-4 w-4 text-darkgrey inline' />
                              <span className='text-xs pl-2 text-darkgrey inline'>{memberCount} joined</span>
                            </>
                          }
                          {!challenge.public &&
                            <span className='text-xs text-darkgrey ml-2'>Private</span>
                          }
                        </div>

                      </>
                    }
                  {categoryNames.length > 0 &&
                    <div className='text-xs text-blue inline mr-1'>{categoryNames.join(', ')}</div>
                  }
                  </div>
                  {challenge.status === 'PUBLISHED' &&
                    <div className = 'w-1/3 flex items-center justify-end h-full' >
                      <SlShareAlt className='cursor-pointer text-grey text-sm inline w-4 h-4 mr-2' onClick={copyLink} />
                    </div>
                  }
                </div>
                {isMember && !checkInButtonDisabled &&
                  <div className='w-1/3'>
                      <div onClick={(event) => { event.stopPropagation() }} className='flex items-center justify-center w-full h-full'>
                        <CheckInButton challenge={challenge} className={`cursor-pointer shadow-lg shadow-darkgrey  bg-red hover:bg-green-500 text-white rounded-md p-2 justify-center text-xs italic disabled:bg-gray-400 ${checkInButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`} />
                      </div>
                  </div>
                }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

function DraftBadge ({ challenge, className = '' }: { challenge: ChallengeSummary | Challenge, className?: string }): JSX.Element {
  if (challenge?.status !== 'DRAFT') {
    return <></>
  }
  return (
    <div className={`text-sm font-bold text-yellow ${className}`}>
      Draft
    </div>
  )
}

export function CardChallengeHomeSkeleton (): JSX.Element {
  return (
    <div className='mt-2 drop-shadow-none mr-2 w-full cursor-pointer'>
      <div className='drop-shadow-none'>
        <div className='p-1 bg-white relative'>
          <div className='w-full flex'>
            <div className='w-1/5 flex items-center justify-center'>
              <div className='relative border rounded-md p-2 pb-1 border-gray-200 bg-gray-200 w-[90px] h-[90px]'>
                <div className='w-full h-16 bg-gray-200 animate-pulse rounded-md'></div>
              </div>
            </div>
            <div className='w-3/5 border-0 mb-2 pt-2 pl-5'>
              <div className='h-4 bg-gray-200 animate-pulse rounded-md mb-2'></div>
              <div className='h-4 bg-gray-200 animate-pulse rounded-md mb-2'></div>
              <div className='h-4 bg-gray-200 animate-pulse rounded-md'></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
