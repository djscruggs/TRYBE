import { useNavigate, useParams } from '@remix-run/react'
import { useEffect, useState } from 'react'
import type { ChallengeSummary, MemberChallenge } from '~/utils/types'
import ChallengeList from '~/components/challengeList'
import axios from 'axios'

export default function ChallengesIndex (): JSX.Element {
  const [challenges, setChallenges] = useState<ChallengeSummary[]>([])
  const params = useParams()
  const [status, setStatus] = useState(params.status ?? 'active')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [memberships, setMemberships] = useState<MemberChallenge[]>([])
  const handleStatusChange = (newStatus: string): void => {
    setStatus(newStatus)
    navigate(`/challenges/${newStatus}`)
  }
  const loadData = async (): Promise<void> => {
    setLoading(true)
    const response = await axios.get(`/api/challenges/${status}`)
    console.log(response.data)
    setChallenges(response.data.challenges as ChallengeSummary[])
    setMemberships(response.data.memberships as MemberChallenge[])
    setLoading(false)
  }
  useEffect(() => {
    void loadData()
  }, [status])

  return (

            <div className="w-full">
              <div className='text-lg py-2 flex items-center justify-center w-full relative'>
                  <div className={`w-fit cursor-pointer ${status === 'active' ? 'border-b-2 border-red' : ''}`} onClick={() => { handleStatusChange('active') }}>Active</div>
                  <div className={`w-fit mx-8 cursor-pointer ${status === 'upcoming' ? 'border-b-2 border-red' : ''}`} onClick={() => { handleStatusChange('upcoming') }}>Upcoming</div>
                  <div className={`w-fit mr-8 cursor-pointer ${status === 'mine' ? 'border-b-2 border-red' : ''}`} onClick={() => { handleStatusChange('mine') }}>Hosting</div>
                  <div className={`absolute right-2 text-xs text-gray-500 underline cursor-pointer ${status === 'archived' ? 'text-red' : ''}`} onClick={() => { handleStatusChange('archived') }}>Archived</div>

              </div>
              <div className="flex flex-col items-center max-w-lg w-full">
                {!loading && challenges.length === 0 &&
                  <div className="text-center mt-10">No {status !== 'mine' ? status : ''} challenges found</div>
                }
                <ChallengeList challenges={challenges} memberships={memberships} isLoading={loading} />
              </div>
          </div>

  )
}
