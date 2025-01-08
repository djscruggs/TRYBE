import { type ChallengeSummary, type MemberChallenge } from '~/utils/types'
import useGatedNavigate from '~/hooks/useGatedNavigate'
import { CheckInButton } from './checkinButton'
import { useState, useEffect, useContext } from 'react'
import { toast } from 'react-hot-toast'
import { getShortUrl } from '~/utils/helpers/challenge'
import DialogShare from './dialogShare'
import { CurrentUserContext } from '~/contexts/CurrentUserContext'
import useCohortId from '~/hooks/useCohortId'
import { MemberContext } from '~/contexts/MemberContext'
interface ChallengeTabsProps {
  challenge: ChallengeSummary
  className?: string
  which?: string
  membership?: MemberChallenge
}

export default function ChallengeTabs (props: ChallengeTabsProps): JSX.Element {
  const { challenge, which } = props
  const { currentUser } = useContext(CurrentUserContext)
  const { membership } = useContext(MemberContext)
  const cohortId = useCohortId()
  const isMember = useState(Boolean(membership?.id ?? (challenge.type === 'SCHEDULED' && props.challenge.userId === currentUser?.id)))
  const gatedNavigate = useGatedNavigate()
  const [currentTab, setCurrentTab] = useState(which)
  const goTo = (path: string, which: string, gated: boolean = false): void => {
    if (!isMember) {
      if (path === '/chat' || path === '/checkins') {
        const msg = path === '/chat' ? 'access chat' : 'view progress'
        toast.error(`You must be a member to ${msg}`)
        return
      }
    }
    const url = `/challenges/v/${challenge.id}${path}`
    gatedNavigate(url, gated)
    setCurrentTab(which)
  }
  const addCohortId = (path: string): string => {
    if (cohortId) {
      path = path + '/' + cohortId
    }
    return path
  }
  const [sharing, setSharing] = useState(false)
  useEffect(() => {
    setCurrentTab(which)
  }, [which])

  return (
    <>
    <div className='relative text-lg py-2 flex items-center justify-center w-full gap-4'>
      <div className={`w-fit cursor-pointer border-b-2 border-red ${currentTab === 'about' ? 'border-red' : ' border-white  hover:border-grey'}`} onClick={() => { goTo(addCohortId('/about'), 'about') }}>About</div>
      <div className={`w-fit cursor-pointer border-b-2 border-red ${currentTab === 'program' ? 'border-red' : 'border-white  hover:border-grey '}`} onClick={() => { goTo('/program', 'program') }}>Program</div>
      <div className={`w-fit ${isMember ? 'cursor-pointer' : 'cursor-not-allowed'} border-b-2 border-red ${currentTab === 'progress' ? 'border-red' : 'border-white  hover:border-grey '}`} onClick={() => { goTo(addCohortId('/checkins'), 'progress', true) }}>Progress</div>
      {(challenge.type === 'SCHEDULED' || challenge?._count?.members > 1) && <div className={`w-fit ${isMember ? 'cursor-pointer' : 'cursor-not-allowed'} border-b-2 border-red ${currentTab === 'chat' ? 'border-red' : 'border-white  hover:border-grey'}`} onClick={() => { goTo(addCohortId('/chat'), 'chat', true) }}>Chat</div>}
      <div className=' float-right -mt-1'>
        {isMember && <CheckInButton challenge={challenge} size='xs' />}
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
