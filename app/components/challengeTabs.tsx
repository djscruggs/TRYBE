import { type ChallengeSummary } from '~/utils/types'
import { useNavigate } from '@remix-run/react'
import useGatedNavigate from '~/hooks/useGatedNavigate'
import { CheckInButton } from './checkinButton'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
interface ChallengeTabsProps {
  challenge: ChallengeSummary
  className?: string
  which?: string
  isMember?: boolean
}

export default function ChallengeTabs (props: ChallengeTabsProps): JSX.Element {
  const { challenge, which } = props
  const [isMember, setIsMember] = useState(props.isMember)
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
  useEffect(() => {
    setCurrentTab(which)
  }, [which])
  useEffect(() => {
    setIsMember(props.isMember)
  }, [props.isMember])
  return (
    <>
    <div className='relative text-lg py-2 flex items-center justify-center w-full gap-4'>
      <div className={`w-fit cursor-pointer border-b-2 border-red ${currentTab === 'about' ? 'border-red' : ' border-white  hover:border-grey'}`} onClick={() => { goTo('/about', 'about') }}>About</div>
      <div className={`w-fit cursor-pointer border-b-2 border-red ${currentTab === 'program' ? 'border-red' : 'border-white  hover:border-grey '}`} onClick={() => { goTo('/program', 'program') }}>Program</div>
      <div className={`w-fit ${isMember ? 'cursor-pointer' : 'cursor-not-allowed'} border-b-2 border-red ${currentTab === 'progress' ? 'border-red' : 'border-white  hover:border-grey '}`} onClick={() => { goTo('/checkins', 'progress') }}>Progress</div>
      {(challenge.type === 'SCHEDULED' || challenge?._count?.members > 1) && <div className={`w-fit ${isMember ? 'cursor-pointer' : 'cursor-not-allowed'} border-b-2 border-red ${currentTab === 'chat' ? 'border-red' : 'border-white  hover:border-grey'}`} onClick={() => { goTo('/chat', 'chat', true) }}>Chat</div>}
      <div className=' float-right -mt-1'>
        {isMember && <CheckInButton challenge={challenge} size='xs' className='px-2'/>}
      </div>
    </div>
    </>
  )
}
