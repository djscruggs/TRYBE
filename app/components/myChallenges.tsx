import ChallengeList from '~/components/challengeList'
import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { type ChallengeSummary, type MemberChallenge } from '~/utils/types'
import { useNavigate } from '@remix-run/react'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import useGatedNavigate from '~/hooks/useGatedNavigate'

interface MyChallengesProps {
  range: string
  scrollToBrowse: () => void
  centered?: boolean
}

export default function MyChallenges (props: MyChallengesProps): JSX.Element {
  const { range, scrollToBrowse, centered } = props
  const [status, setStatus] = useState(range ?? 'active')
  const [loading, setLoading] = useState(true)
  const [myChallenges, setMyChallenges] = useState<ChallengeSummary[]>([])
  const [memberships, setMemberships] = useState<MemberChallenge[]>([])
  const { currentUser } = useContext(CurrentUserContext)
  const gatedNavigate = useGatedNavigate()
  const loadData = async (): Promise<void> => {
    setLoading(true)
    const url = `/api/challenges/${status}`
    const response = await axios.get(url)

    const allChallenges = response.data.challenges as ChallengeSummary[]
    const userMemberships = response.data.memberships as MemberChallenge[]
    // Filter challenges where the user is a member or owner
    const userChallenges = allChallenges.filter(challenge =>
      userMemberships.some(membership => membership.challengeId === challenge.id) ||
      challenge.userId === currentUser?.id
    )
    setMyChallenges(userChallenges)
    setMemberships(userMemberships)
    setLoading(false)
  }
  useEffect(() => {
    void loadData()
  }, [status])
  return (
    <div className={`mb-8 ${centered ? 'flex-col justify-center items-center' : ''}`}>
      <div className={`text-lg w-full relative ${centered ? 'text-center' : ''}`}>
        <div className='text-red cursor-pointer font-bold'>My Challenges</div>
          {/* {currentUser &&
            <div className={`absolute right-2 text-xs text-gray-500 underline cursor-pointer ${status === 'archived' ? 'text-red' : ''}`} onClick={() => { handleStatusChange('archived') }}>Archived</div>
          } */}
        </div>
        <div className="flex flex-col rounded-md max-w-lg w-full">
          {!loading && myChallenges.length === 0 && memberships.length === 0
            ? (
            <>
              <p className='text-left text-gray-500'>It&apos;s A Little Quiet Here... Ready To Spark Some Action?</p>
              <div className={`flex items-center ${centered ? 'justify-center' : 'justify-start'} space-x-2 mt-4`}>
                <button className='text-white bg-red p-2 text-xs rounded-full underline italic px-4' onClick={() => { scrollToBrowse ? scrollToBrowse() : gatedNavigate('/challenges', false) }}>BROWSE CHALLENGES</button>
                <button className='text-red bg-white border border-red p-2 text-xs rounded-full underline italic px-4' onClick={() => { gatedNavigate('/challenges/new', true) }}>CREATE YOUR OWN</button>
              </div>
            </>
              )
            : (
            <ChallengeList challenges={myChallenges} memberships={memberships} isLoading={loading} />
              )}
        </div>
    </div>
  )
}
