import { type ChallengeSummary, type MemberChallenge } from '~/utils/types'
import useGatedNavigate from '~/hooks/useGatedNavigate'
import { CheckInButton } from './checkinButton'
import { useState, useEffect, useContext, JSX } from 'react'
import { toast } from 'react-hot-toast'
import { getShortUrl } from '~/utils/helpers/challenge'
import DialogShare from './dialogShare'
import { CurrentUserContext } from '~/contexts/CurrentUserContext'
import useCohortId from '~/hooks/useCohortId'
import { useMemberContext } from '~/contexts/MemberContext'
import { useLocation } from 'react-router'

interface ChallengeTabsProps {
  challenge: ChallengeSummary
  className?: string
}

export default function ChallengeTabs (props: ChallengeTabsProps): JSX.Element {
  const { challenge } = props
  const { currentUser } = useContext(CurrentUserContext)
  const { membership, refreshUserCheckIns } = useMemberContext()
  const cohortId = useCohortId()
  const [isMember, setIsMember] = useState(Boolean(membership?.id ?? (challenge.type === 'SCHEDULED' && props.challenge.userId === currentUser?.id)))
  const gatedNavigate = useGatedNavigate()
  const location = useLocation()
  const currentTab = location.pathname.split('/').pop()

  const goTo = (path: string, gated: boolean = false): void => {
    if (!isMember) {
      if (path.includes('/chat') || path.includes('/checkins')) {
        const msg = path.includes('/chat') ? 'access chat' : 'view progress'
        toast.error(`You must be a member to ${msg}`)
        return
      }
    }
    const url = `/challenges/v/${challenge.id}${path}`
    gatedNavigate(url, gated)
  }
  const addCohortId = (path: string): string => {
    if (cohortId) {
      path = path + '/' + cohortId
    }
    return path
  }
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    setIsMember(Boolean(membership?.id ?? (challenge.type === 'SCHEDULED' && props.challenge.userId === currentUser?.id)))
  }, [membership])

  return (
    <>
    <div className='relative text-lg py-2 flex items-center justify-center w-full gap-4'>
      <div className={`w-fit cursor-pointer border-b-2 border-red ${currentTab === 'about' ? 'border-red' : ' border-white  hover:border-grey'}`} onClick={() => { goTo(addCohortId('/about')) }}>About</div>
      <div className={`w-fit cursor-pointer border-b-2 border-red ${currentTab === 'program' ? 'border-red' : 'border-white  hover:border-grey '}`} onClick={() => { goTo('/program') }}>Program</div>
      <div className={`w-fit ${isMember ? 'cursor-pointer' : 'cursor-not-allowed'} border-b-2 border-red ${currentTab === 'checkins' ? 'border-red' : 'border-white  hover:border-grey '}`} onClick={() => { goTo(addCohortId('/checkins'), true) }}>Progress</div>
      {(challenge.type === 'SCHEDULED' || challenge?._count?.members > 1) && <div className={`w-fit ${isMember ? 'cursor-pointer' : 'cursor-not-allowed'} border-b-2 border-red ${currentTab === 'chat' ? 'border-red' : 'border-white  hover:border-grey'}`} onClick={() => { goTo(addCohortId('/chat'), true) }}>Chat</div>}
      <div className=' float-right -mt-1'>
        {isMember && <CheckInButton challenge={challenge} size='xs' afterCheckIn={refreshUserCheckIns}/>}
      </div>
      {/* <div className='flex justify-center'>
          <button onClick={() => { setSharing(true) }} className='text-red underline text-xs'>Share Challenge</button>
      </div> */}
      <DialogShare
        isOpen={sharing}
        prompt='Copy this link to invite your friends'
        link={getShortUrl(challenge, props.membership, cohortId)}
        onClose={() => { setSharing(false) }}
      />

    </div>
    </>
  )
}
