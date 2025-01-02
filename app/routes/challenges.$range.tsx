import { useNavigate, useParams } from '@remix-run/react'
import { useEffect, useState, useContext, useRef } from 'react'
import type { ChallengeSummary, MemberChallenge } from '~/utils/types'
import ChallengeList from '~/components/challengeList'
import axios, { type AxiosRequestConfig } from 'axios'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import MyChallenges from '~/components/myChallenges'
export default function ChallengesIndex (): JSX.Element {
  const browseRef = useRef<HTMLDivElement | null>(null)
  const [isExtended, setIsExtended] = useState(false) // this is used to extend the screen that the scroll into view is applied to
  const [categoryFilter, setCategoryFilter] = useState<string[]>([])
  const [upcomingChallenges, setUpcomingChallenges] = useState<ChallengeSummary[]>([])
  const params = useParams()
  const [status, setStatus] = useState(params.range ?? 'active')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [memberships, setMemberships] = useState<MemberChallenge[]>([])
  // variable name matches the way it's used in the db
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const [selfGuided, setSelfGuided] = useState(false)
  const { currentUser } = useContext(CurrentUserContext)
  const handleStatusChange = (newStatus: string): void => {
    setStatus(newStatus)
    navigate(`/challenges/${newStatus}`)
  }
  const handleCategoryChange = (newCategory: string): void => {
    setCategoryFilter(prev => prev.includes(newCategory) ? prev.filter(cat => cat !== newCategory) : [...prev, newCategory])
  }

  const loadUpcomingChallenges = async (): Promise<void> => {
    setLoading(true)
    let url = '/api/challenges/upcoming'
    if (status === 'all') {
      url = '/api/challenges/all'
    }
    const params: AxiosRequestConfig['params'] = { }
    if (categoryFilter.length > 0) {
      params.category = categoryFilter.join(',')
    }
    if (selfGuided) {
      params.type = 'SELF_LED'
    }
    const response = await axios.get(url, { params })

    // Filter out challenges where the user is already a member
    const allUpcomingChallenges = response.data.challenges as ChallengeSummary[]
    const memberships = response.data.memberships as MemberChallenge[]
    const filteredUpcomingChallenges = allUpcomingChallenges.filter(challenge =>
      !memberships.some(membership => membership.challengeId === challenge.id) &&
      challenge.userId !== currentUser?.id
    )
    setUpcomingChallenges(filteredUpcomingChallenges)
    setLoading(false)
  }
  const [triggerRender, setTriggerRender] = useState(1)
  const scrollToBrowse = (): void => {
    setIsExtended(true)
    setTriggerRender(prev => prev + 1)
  }
  useEffect(() => {
    if (isExtended && browseRef.current) {
      browseRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [triggerRender])

  useEffect(() => {
    void loadUpcomingChallenges()
  }, [status])
  useEffect(() => {
    void loadUpcomingChallenges()
  }, [categoryFilter, selfGuided])
  const categories = ['Meditation', 'Journal', 'Creativity', 'Health']
  return (
        <div className="w-full pl-2">
          <MyChallenges range='active' scrollToBrowse={scrollToBrowse} />
          {!loading &&
            <>
              <div ref={browseRef} className='text-red font-bold text-lg mb-2'>Browse Challenges</div>
              <div className='space-x-1 md:space-x-2 flex items-center justify-between md:justify-start relative text-white text-xs md:text-sm'>
                {categories.map((cat: string) => (
                  <div
                    key={cat}
                    className={`w-fit p-1 px-2 rounded-md cursor-pointer ${categoryFilter.includes(cat) ? 'bg-gray-400' : 'text-black bg-gray-100'}`}
                    onClick={() => { handleCategoryChange(cat) }}
                  >
                    {cat}
                  </div>
                ))}
                {currentUser?.role === 'ADMIN' &&
                <>
                  <span className='px-1 md:px-2 text-grey'>|</span>
                  <div className={`w-fit p-1 px-2 rounded-md cursor-pointer ${selfGuided ? 'bg-gray-400' : 'text-black bg-gray-100'}`} onClick={() => { setSelfGuided(prev => !prev) }}>
                    Self-Guided
                  </div>
                </>
                }

              </div>
              {!loading && upcomingChallenges.length === 0 &&
                <p className='text-left text-gray-500 mt-4'>No {selfGuided ? 'self-guided' : 'scheduled'} challenges in this category.</p>
              }
              <div className="flex flex-col items-center max-w-lg w-full">
                <ChallengeList challenges={upcomingChallenges} memberships={memberships} isLoading={loading} />
              </div>
              {isExtended &&
                <div className='h-[800px]'></div>
              }
            </>
          }
        </div>
  )
}
