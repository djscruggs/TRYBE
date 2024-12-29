import { type Challenge, type ChallengeSummary } from '~/utils/types'
import { useNavigate } from '@remix-run/react'
import useGatedNavigate from '~/hooks/useGatedNavigate'
import { CheckInButton } from './checkinButton'

interface ChallengeTabsProps {
  challenge: Challenge | ChallengeSummary
  className?: string
  isOverview?: boolean
  isProgram?: boolean
  isPosts?: boolean
  isMember?: boolean
}

export default function ChallengeTabs ({ challenge, isOverview, isProgram, isPosts, isMember }: ChallengeTabsProps): JSX.Element {
  const navigate = useNavigate()
  const gatedNavigate = useGatedNavigate()
  return (
    <>
    <div className='relative text-lg py-2 flex items-center justify-center w-full gap-4'>
      <div className={`w-fit cursor-pointer border-b-2 border-red ${isOverview ? 'border-red' : ' border-white  hover:border-grey'}`} onClick={() => { navigate(`/challenges/v/${challenge.id}`) }}>Overview</div>
      <div className={`w-fit cursor-pointer border-b-2 border-red ${isProgram ? 'border-red' : 'border-white  hover:border-grey '}`} onClick={() => { navigate(`/challenges/v/${challenge.id}/program`) }}>Program</div>
      {challenge.type === 'SCHEDULED' && <div className={`w-fit cursor-pointer border-b-2 border-red ${isPosts ? 'border-red' : 'border-white  hover:border-grey'}`} onClick={() => { gatedNavigate(`/challenges/v/${challenge.id}/chat`) }}>Chat</div>}
      <div className=' absolute right-0'>
        {isMember && <CheckInButton challenge={challenge} size='xs' />}
      </div>
    </div>
    </>
  )
}
