import axios from 'axios'
import { useEffect, useContext, useState } from 'react'
import { Spinner } from '@material-tailwind/react'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import ChallengeList from '~/components/challengeList'
import { type MetaFunction, Navigate } from '@remix-run/react'
import type { ChallengeSummary } from '~/utils/types'
export const meta: MetaFunction = () => {
  return [
    { title: 'My Challenges' },
    {
      property: 'og:title',
      content: 'Challenge Templates'
    }
  ]
}
export default function ChallengeMine (): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  if (currentUser?.role !== 'ADMIN') {
    return <Navigate to="/" />
  }
  const [loading, setLoading] = useState(true)
  const [myChallenges, setMyChallenges] = useState<ChallengeSummary[]>([])
  const loadData = async (): Promise<void> => {
    setLoading(true)
    const url = '/api/challenges/mine'
    const response = await axios.get(url)
    console.log(response.data.challenges)
    setMyChallenges(response.data.challenges as ChallengeSummary[])
    setLoading(false)
  }
  useEffect(() => {
    void loadData()
  }, [])

  return (
    <>
      <div className='flex items-center  max-w-xl mt-14'>
        <div className="flex flex-col items-center max-w-lg w-full">
            <h1 className="text-3xl font-bold mb-4 w-full ml-2 md:ml-0">
                My Challenges
            </h1>
            {loading && <Spinner />}
            {!loading && myChallenges.length > 0 &&
              <ChallengeList challenges={myChallenges} memberships={[]} isLoading={loading} />
            }
            {/* <p className='ml-2 md:ml-0 text-gray-500'>View your current challenges, browse upcoming challenges, or start your own!</p>
            {currentUser && <Button placeholder='Create a Challenge' size="sm" onClick={() => { navigate('./new') }} className="bg-red mb-4 mt-4">Create a Challenge</Button>}
            <Outlet /> */}

          </div>
        </div>
    </>
  )
}
