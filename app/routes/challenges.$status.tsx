import { useNavigate, useParams } from '@remix-run/react'
import { useEffect, useState, useContext } from 'react'
import type { ChallengeSummary, MemberChallenge } from '~/utils/types'
import ChallengeList from '~/components/challengeList'
import axios from 'axios'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
export default function ChallengesIndex (): JSX.Element {
  const [myChallenges, setMyChallenges] = useState<ChallengeSummary[]>([])
  const [challenges, setChallenges] = useState<ChallengeSummary[]>([])
  const [category, setCategory] = useState<string>('')
  const params = useParams()
  const [status, setStatus] = useState(params.status ?? 'active')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [memberships, setMemberships] = useState<MemberChallenge[]>([])
  const { currentUser } = useContext(CurrentUserContext)
  const handleStatusChange = (newStatus: string): void => {
    setStatus(newStatus)
    navigate(`/challenges/${newStatus}`)
  }
  const handleCategoryChange = (newCategory: string): void => {
    setCategory(newCategory)
    navigate(`/challenges/${status}?category=${newCategory}`)
  }
  const loadData = async (): Promise<void> => {
    setLoading(true)
    const response = await axios.get(`/api/challenges/${status}`)

    const allChallenges = response.data.challenges as ChallengeSummary[]
    const userMemberships = response.data.memberships as MemberChallenge[]

    // Filter challenges where the user is a member or owner
    const userChallenges = allChallenges.filter(challenge =>
      userMemberships.some(membership => membership.challengeId === challenge.id) ||
      challenge.userId === currentUser?.id
    )

    // Filter challenges where the user is not a member or owner
    const otherChallenges = allChallenges.filter(challenge =>
      !userMemberships.some(membership => membership.challengeId === challenge.id) &&
      challenge.userId !== currentUser?.id
    )

    setMyChallenges(userChallenges)
    setMemberships(userMemberships)
    setChallenges(otherChallenges)
    setLoading(false)
  }
  useEffect(() => {
    void loadData()
  }, [status])

  return (
        <div className="w-full">
          <div className='text-lg py-2 flex items-center justify-start w-full relative'>
            <div className='text-red cursor-pointer' onClick={() => { handleStatusChange('active') }}>My Challenges</div>
            <div className={`absolute right-2 text-xs text-gray-500 underline cursor-pointer ${status === 'archived' ? 'text-red' : ''}`} onClick={() => { handleStatusChange('archived') }}>Archived</div>

          </div>
          <div className="flex flex-col items-center max-w-lg w-full">
            {!loading && myChallenges.length === 0 &&
              <div className="text-center mt-10">No {status !== 'mine' ? status : ''} challenges found</div>
            }
            <ChallengeList challenges={myChallenges} memberships={memberships} isLoading={loading} />
          </div>
          {!loading && challenges.length > 0 &&
            <>
              <div className='text-red'>Browse Challenges</div>
              <div className='text-lg py-2 flex items-center justify-start w-full relative'>
                <div className={`w-fit cursor-pointer ${category === 'meditation' ? 'border-b-2 border-red' : ''}`} onClick={() => { handleCategoryChange('meditation') }}>Meditation</div>
                <div className={`w-fit mx-8 cursor-pointer ${category === 'journal' ? 'border-b-2 border-red' : ''}`} onClick={() => { handleCategoryChange('journal') }}>Journal</div>
                <div className={`w-fit mr-8 cursor-pointer ${category === 'creativity' ? 'border-b-2 border-red' : ''}`} onClick={() => { handleCategoryChange('creativity') }}>Creativity</div>
                <div className={`w-fit mr-8 cursor-pointer ${category === 'self-guided' ? 'border-b-2 border-red' : ''}`} onClick={() => { handleCategoryChange('self-guided') }}>Self-Guided</div>
              </div>
              <div className="flex flex-col items-center max-w-lg w-full">
                <div className="text-center mt-10">No {status !== 'mine' ? status : ''} challenges found</div>
                <ChallengeList challenges={challenges} memberships={memberships} isLoading={loading} />
              </div>
            </>
          }
        </div>
  )
}
