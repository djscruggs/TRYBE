import { type MetaFunction, useRouteLoaderData } from '@remix-run/react'
import type { Challenge, CheckIn, MemberChallenge } from '~/utils/types'
import CheckinsList from '~/components/checkinsList'
import { useContext, useEffect, useState } from 'react'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import axios from 'axios'
import { Spinner } from '@material-tailwind/react'
import { ProgressChart } from '~/components/progressChart'

export const meta: MetaFunction = () => {
  return [
    { title: 'Checkins' },
    {
      property: 'og:title',
      content: 'Checkins'
    }
  ]
}
export default function MyCheckIns (): JSX.Element {
  const { membership, challenge } = useRouteLoaderData<typeof useRouteLoaderData>('routes/challenges.v.$id') as { membership: MemberChallenge, challenge: Challenge }
  const { currentUser } = useContext(CurrentUserContext)
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [isLoading, setIsLoading] = useState(true)
  if (!membership && challenge.userId !== currentUser?.id) {
    return <></>
  }
  const isMember = Boolean(membership?.id ?? challenge?.userId === currentUser?.id)
  const fetchCheckIns = async (): Promise<void> => {
    setIsLoading(true)
    const response = await axios.get(`/api/checkins/${challenge.id}/${currentUser?.id}`)
    setCheckIns(response.data.checkIns as CheckIn[])
    setIsLoading(false)
  }
  useEffect(() => {
    void fetchCheckIns()
  }, [challenge.id, currentUser?.id])
  return (
    <div className={`flex flex-col ${isLoading ? 'items-center' : 'items-start'} justify-center mt-4  w-full max-w-lg md:max-w-xl`}>

      {isLoading
        ? <Spinner />
        : <>
        <div className='w-full flex items-center justify-center mb-8'>
          <div className='max-w-[200px] flex-col items-center justify-center'>
            <ProgressChart challenge={challenge} checkIns={checkIns} />
          </div>
        </div>
        <CheckinsList checkIns={checkIns} allowComments={false} posts={[]} newestComment={null}/>
      </>
      }
    </div>
  )
}
