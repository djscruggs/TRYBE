import { useNavigate, useParams } from '@remix-run/react'
import { useEffect, useState, useContext, useRef } from 'react'
import type { ChallengeSummary, MemberChallenge } from '~/utils/types'
import ChallengeList from '~/components/challengeList'
import axios, { type AxiosRequestConfig } from 'axios'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
export default function ChallengesIndex (): JSX.Element {
  const [myChallenges, setMyChallenges] = useState<ChallengeSummary[]>([])
  const browseRef = useRef<HTMLDivElement | null>(null)
  const [isExtended, setIsExtended] = useState(false) // this is used to extend the screen that the scroll into view is applied to
  const [categoryFilter, setCategoryFilter] = useState<string[]>([])
  const [upcomingChallenges, setUpcomingChallenges] = useState<ChallengeSummary[]>([])
  const params = useParams()
  const [status, setStatus] = useState(params.range ?? 'active')
  const [loading, setLoading] = useState(true)
  const [loadingUpcoming, setLoadingUpcoming] = useState(true)
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
    const otherChallenges = allChallenges.filter(challenge =>
      !userMemberships.some(membership => membership.challengeId === challenge.id) &&
      challenge.userId !== currentUser?.id
    )

    // Filter challenges where the user is not a member or owner
    setMyChallenges(userChallenges)
    setMemberships(userMemberships)
    setLoading(false)
  }
  const loadUpcomingChallenges = async (): Promise<void> => {
    setLoadingUpcoming(true)
    const url = '/api/challenges/upcoming'
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
    setLoadingUpcoming(false)
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
    void loadData().then(() => {
      void loadUpcomingChallenges()
    }).catch(console.error)
  }, [status])
  useEffect(() => {
    void loadUpcomingChallenges()
  }, [categoryFilter, selfGuided])
  const categories = ['Meditation', 'Journal', 'Creativity', 'Health']
  return (
        <div className="w-full">
          {!loading &&
            <>
              <div className='mb-8'>
                  <div className='text-lg flex items-center justify-start w-full relative'>
                    <div className='text-red cursor-pointer font-bold' onClick={() => { handleStatusChange('active') }}>My Challenges</div>
                      {currentUser &&
                        <div className={`absolute right-2 text-xs text-gray-500 underline cursor-pointer ${status === 'archived' ? 'text-red' : ''}`} onClick={() => { handleStatusChange('archived') }}>Archived</div>
                      }
                  </div>
                  <div className="flex flex-col rounded-md p-2 max-w-lg w-full">
                    {!loading && myChallenges.length === 0
                      ? (
                      <>
                        <p className='text-left text-gray-500'>It&apos;s A Little Quiet Here... Ready To Spark Some Action?</p>
                        <div className='flex items-center justify-start space-x-2 mt-4'>
                          <button className='text-white bg-red p-2 text-xs rounded-full underline italic px-4' onClick={scrollToBrowse}>BROWSE CHALLENGES</button>
                          <button className='text-red bg-white border border-red p-2 text-xs rounded-full underline italic px-4' onClick={() => { navigate('/challenges/new') }}>CREATE YOUR OWN</button>
                        </div>
                      </>
                        )
                      : (
                      <ChallengeList challenges={myChallenges} memberships={memberships} isLoading={loading} />
                        )}
                  </div>
              </div>
              {currentUser?.role === 'ADMIN' &&
                <div className='mb-8'>
                  <div className='text-lg flex-col justify-start w-full relative'>
                    <div className='text-red font-bold'>What&apos;s New</div>
                  <div className='flex items-start justify-start space-x-4'>
                    <div className='h-40 w-48 border border-red rounded-md bg-red p-4 text-white'>Item 1</div>
                    <div className='h-40 w-48 border border-red rounded-md bg-red p-4 text-white'>Item 2</div>
                  </div>
                </div>
              </div>
              }
            </>
          }
          {!loading &&
            <>
              <div ref={browseRef} className='text-red font-bold text-lg'>Browse Challenges</div>
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
                <span className='px-2 text-grey'>|</span>
                <div className={`w-fit p-1 px-2 rounded-md cursor-pointer ${selfGuided ? 'bg-gray-400' : 'text-black bg-gray-100'}`}
                  onClick={() => { setSelfGuided(prev => !prev) }}
                >
                 Self-Guided
                </div>

              </div>
              {!loadingUpcoming && upcomingChallenges.length === 0 &&
                <p className='text-left text-gray-500 mt-4'>No {selfGuided ? 'self-guided' : 'scheduled'} challenges in this category.</p>
              }
              <div className="flex flex-col items-center max-w-lg w-full">
                <ChallengeList challenges={upcomingChallenges} memberships={memberships} isLoading={loadingUpcoming} />
              </div>
              {isExtended &&
                <div className='h-[800px]'></div>
              }
            </>
          }
        </div>
  )
}
