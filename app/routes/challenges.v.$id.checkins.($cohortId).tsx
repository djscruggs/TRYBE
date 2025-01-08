import { type MetaFunction, useRouteLoaderData } from '@remix-run/react'
import type { Challenge, CheckIn } from '~/utils/types'
import CheckinsList from '~/components/checkinsList'
import { useContext, useEffect, useState } from 'react'
import { CurrentUserContext } from '~/contexts/CurrentUserContext'
import { MemberContext } from '~/contexts/MemberContext'
import axios from 'axios'
import { Spinner } from '@material-tailwind/react'
import 'react-circular-progressbar/dist/styles.css'
import { ProgressChart } from '~/components/progressChart'

export const meta: MetaFunction = () => {
  return [
    { title: 'View Progress' },
    {
      property: 'og:title',
      content: 'View Progress'
    }
  ]
}
export default function MyCheckIns (): JSX.Element {
  const { challenge } = useRouteLoaderData<typeof useRouteLoaderData>('routes/challenges.v.$id') as { challenge: Challenge }
  const { currentUser } = useContext(CurrentUserContext)
  const { membership } = useContext(MemberContext)
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [isLoading, setIsLoading] = useState(true)
  if (!membership && challenge.userId !== currentUser?.id) {
    return <></>
  }
  const fetchCheckIns = async (): Promise<void> => {
    if (!currentUser && !membership?.userId && challenge.userId !== currentUser?.id) {
      setCheckIns([])
      setIsLoading(false)
      return
    }
    const uid = membership?.userId ?? currentUser?.id
    setIsLoading(true)
    let url = `/api/checkins/${challenge.id}/${uid}`
    if (challenge.type === 'SELF_LED' && membership?.cohortId) {
      url += `/${membership.cohortId}`
    }
    const response = await axios.get(url)
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
        <div className='w-full flex items-center justify-center mb-12 mt-10'>
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
