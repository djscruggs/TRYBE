import { useNavigate, useParams, useSearchParams } from '@remix-run/react'
import { useEffect, useState, useContext } from 'react'
import type { ChallengeSummary, MemberChallenge } from '~/utils/types'
import ChallengeList from '~/components/challengeList'
import axios, { type AxiosRequestConfig } from 'axios'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { Switch } from '@material-tailwind/react'
export default function ChallengesIndex (): JSX.Element {
  const [myChallenges, setMyChallenges] = useState<ChallengeSummary[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string[]>('')
  const [upcomingChallenges, setUpcomingChallenges] = useState<ChallengeSummary[]>([])
  const params = useParams()
  const [status, setStatus] = useState(params.status ?? 'active')
  const [loading, setLoading] = useState(true)
  const [loadingUpcoming, setLoadingUpcoming] = useState(true)
  const navigate = useNavigate()
  const [memberships, setMemberships] = useState<MemberChallenge[]>([])
  const [SELF_LED, setSELF_LED] = useState(false)
  const { currentUser } = useContext(CurrentUserContext)
  const handleStatusChange = (newStatus: string): void => {
    setStatus(newStatus)
    navigate(`/challenges/${newStatus}`)
  }
  const handleCategoryChange = (newCategory: string): void => {
    setCategoryFilter(prev => prev.includes(newCategory) ? prev.filter(cat => cat !== newCategory) : [...prev, newCategory])
  }
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

    // Filter challenges where the user is not a member or owner
    setMyChallenges(userChallenges)
    setMemberships(userMemberships)
    setLoading(false)
  }
  const handleSelfGuidedChange = (): void => {
    setSELF_LED(prev => !prev)
  }
  const loadUpcomingChallenges = async (): Promise<void> => {
    // if (upcomingChallengesCache) {
    //   setUpcomingChallenges(upcomingChallengesCache)
    //   return
    // }
    setLoadingUpcoming(true)
    const url = '/api/challenges/upcoming'
    const params: AxiosRequestConfig['params'] = { SELF_LED }
    if (categoryFilter.length > 0) {
      params.category = categoryFilter.join(',')
    }
    const response = await axios.get(url, { params })
    setUpcomingChallenges(response.data.challenges as ChallengeSummary[])
    setLoadingUpcoming(false)
  }
  useEffect(() => {
    void loadData()
    void loadUpcomingChallenges()
  }, [status])
  useEffect(() => {
    void loadUpcomingChallenges()
  }, [categoryFilter, SELF_LED])
  const categories = ['Meditation', 'Journal', 'Creativity', 'Health']
  return (
        <div className="w-full">
          {!loading && myChallenges.length > 0 &&
            <>
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
            </>
          }
          {!loading &&
            <>
              <div className='text-red'>Browse Challenges</div>
              <div className='py-2 space-x-2 flex items-center justify-between md:justify-start relative text-white text-xs md:text-sm'>
                {categories.map((cat: string) => (
                  <div
                    key={cat}
                    className={`w-fit p-1 px-2 rounded-md cursor-pointer ${categoryFilter.includes(cat) ? 'bg-gray-400' : 'text-black bg-gray-100'}`}
                    onClick={() => { handleCategoryChange(cat) }}
                  >
                    {cat}
                  </div>
                ))}
                  <div className='w-xs mx-2 text-grey'> | </div>
                  <Switch className='text-xs md:text-sm' crossOrigin="anonymous" label="Self-Guided" checked={SELF_LED} onChange={handleSelfGuidedChange}/>

              </div>
              {!loadingUpcoming && upcomingChallenges.length === 0 &&
                <p className='text-left text-gray-500 mt-4'>No {SELF_LED ? 'self-guided' : 'scheduled'} challenges in this category.</p>
              }
              <div className="flex flex-col items-center max-w-lg w-full">
                <ChallengeList challenges={upcomingChallenges} memberships={memberships} isLoading={loadingUpcoming} />
              </div>
            </>
          }
        </div>
  )
}
