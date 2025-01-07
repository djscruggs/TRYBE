import { useNavigate, useParams } from '@remix-run/react'
import { useEffect, useState, useContext, useRef } from 'react'
import type { ChallengeSummary, MemberChallenge } from '~/utils/types'
import ChallengeList from '~/components/challengeList'
import axios, { type AxiosRequestConfig } from 'axios'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import MyChallenges from '~/components/myChallenges'
import { Spinner } from '@material-tailwind/react'
import { CardChallengeHomeSkeleton } from '~/components/cardChallengeHome'
export default function ChallengesIndex (): JSX.Element {
  const browseRef = useRef<HTMLDivElement | null>(null)
  const [isExtended, setIsExtended] = useState(false) // this is used to extend the screen that the scroll into view is applied to
  const [categoryFilter, setCategoryFilter] = useState<string[]>([])
  const [upcomingChallenges, setUpcomingChallenges] = useState<ChallengeSummary[]>([])
  const params = useParams()
  const [status, setStatus] = useState(params.range ?? 'active')
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

  const loadUpcomingChallenges = async (): Promise<void> => {
    setLoadingUpcoming(true)
    try {
      let url = '/api/challenges/upcoming,active'
      if (status === 'all') {
        url = '/api/challenges/all'
      }
      // const params: AxiosRequestConfig['params'] = { }
      // if (categoryFilter.length > 0) {
      //   params.category = categoryFilter.join(',')
      // }
      // if (selfGuided) {
      //   params.type = 'SELF_LED'
      // }
      const response = await axios.get(url, { params })
      const allUpcomingChallenges = response.data.challenges as ChallengeSummary[]
      const memberships = response.data.memberships as MemberChallenge[]
      const filteredUpcomingChallenges = allUpcomingChallenges.filter(challenge =>
        !memberships.some(membership => membership.challengeId === challenge.id) &&
        challenge.userId !== currentUser?.id
      )
      setUpcomingChallenges(filteredUpcomingChallenges)
      setFilteredChallenges(filteredUpcomingChallenges)
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingUpcoming(false)
    }
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
  const [filteredChallenges, setFilteredChallenges] = useState<ChallengeSummary[]>([])
  useEffect(() => {
    let _filtered: ChallengeSummary[] = []
    if (categoryFilter.length > 0 || selfGuided) {
      if (categoryFilter.length > 0) {
        upcomingChallenges.forEach(challenge => {
          challenge.categories.forEach(category => {
            if (categoryFilter.includes(category.name ?? '')) {
              _filtered.push(challenge)
            }
          })
        })
      } else {
        _filtered = upcomingChallenges.filter(challenge => challenge.type === 'SELF_LED')
      }
      if (selfGuided) {
        _filtered = _filtered.filter(challenge => challenge.type === 'SELF_LED')
      }
      setFilteredChallenges(_filtered)
    } else {
      setFilteredChallenges(upcomingChallenges)
    }
    setIsExtended(true)
  }, [categoryFilter, selfGuided])
  const categories = ['Meditation', 'Journal', 'Creativity', 'Health']
  return (
        <div className="w-full pl-2">
            <MyChallenges range='active,upcoming' scrollToBrowse={scrollToBrowse} />
            <div ref={browseRef} className='text-red font-bold text-lg mb-2'>Browse Challenges</div>
            <div className='space-x-4 flex items-center max-w-lg w-full justify-start text-xs md:text-sm'>
              {categories.map((cat: string) => (
                <div
                  key={cat}
                  className={`w-fit p-1 px-2 rounded-md cursor-pointer ${categoryFilter.includes(cat) ? 'bg-gray-400' : 'text-black bg-gray-100'}`}
                  onClick={() => { handleCategoryChange(cat) }}
                >
                  {cat}
                </div>
              ))}
              <div className='flex items-center justify-start'>
                <span className='text-grey mr-2'>|</span>
                <div className={`w-fit p-1 px-2 rounded-md cursor-pointer ${selfGuided ? 'bg-gray-400' : 'text-black bg-gray-100'}`} onClick={() => { setSelfGuided(prev => !prev) }}>
                  Self-Guided
                </div>
              </div>
            </div>
            {loadingUpcoming &&
              <div className='flex justify-center items-start h-screen mt-0'>
                <div className='flex flex-col w-full'>
                  <CardChallengeHomeSkeleton />
                  <CardChallengeHomeSkeleton />
                  <CardChallengeHomeSkeleton />
                </div>
              </div>
            }
          {!loadingUpcoming &&
            <>
              {filteredChallenges.length === 0 &&
                <p className='text-left text-gray-500 pt-2'>No {selfGuided ? 'self-guided' : 'scheduled'} challenges in this category.</p>
              }
              <div className="flex flex-col items-center max-w-lg w-full mt-4">
                <ChallengeList challenges={filteredChallenges} memberships={memberships} isLoading={loadingUpcoming} />
              </div>
              {isExtended &&
                <div className='h-[800px]'></div>
              }
            </>
          }
        </div>
  )
}
