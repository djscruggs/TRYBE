import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction, json } from '@remix-run/node'
import { useLoaderData, useRevalidator, useRouteLoaderData } from '@remix-run/react'
import { useContext } from 'react'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { fetchCheckIns, loadMemberChallenge } from '~/models/challenge.server'
import type { Challenge, MemberChallenge } from '~/utils/types'
import { userLocale, pluralize } from '~/utils/helpers'
import { differenceInDays } from 'date-fns'
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar'
import { ChallengeMemberCheckin } from '~/components/challengeMemberCheckin'
import 'react-circular-progressbar/dist/styles.css'

export const loader: LoaderFunction = async (args) => {
  const currentUser = await requireCurrentUser(args)
  const userId = Number(args.params.userId ?? currentUser?.id)
  const challengeId = Number(args.params.id)
  const checkIns = await fetchCheckIns(userId, challengeId) as { error?: string }
  return json({ checkIns })
}
export default function CheckIns (): JSX.Element {
  const revalidator = useRevalidator()
  const { checkIns, error } = useLoaderData<typeof loader>()
  const { membership, challenge } = useRouteLoaderData<typeof useRouteLoaderData>('routes/challenges.v.$id')
  const { currentUser } = useContext(CurrentUserContext)
  const locale = userLocale(currentUser)
  const dateFormat = {
    month: 'long',
    day: 'numeric'
  }
  const numDays = differenceInDays(challenge.endAt as Date, challenge.startAt as Date)

  if (error) {
    return <h1>{error}</h1>
  }
  if (!membership) {
    return <p>Loading...</p>
  }
  const progress = (checkIns.length / numDays) * 100
  console.log('progress', progress)
  return (
        <div className='max-w-sm md:max-w-xl lg:max-w-2xl mt-10 flex flex-col items-center md:items-start'>
          <div className='max-w-[200px] flex items-center justify-center'>
            <CircularProgressbarWithChildren
              value={progress}
              maxValue={numDays}

              strokeWidth={5}
              styles={buildStyles({
                textColor: 'red',
                pathColor: 'red'
              })}
            >
              <div className='text-center text-5xl text-red'>{checkIns.length} / {numDays}
              <div className='text-center text-xl text-gray-500'>Days</div>
              </div>
            </CircularProgressbarWithChildren>
          </div>
          <ChallengeMemberCheckin showDetails={true} challenge={challenge} memberChallenge={membership} afterCheckIn={() => { revalidator.revalidate() }} />
          <div className='flex flex-col items-start justify-center mt-4 border border-red  w-full'>
            <p className='text-center text-xl text-gray-500 mb-2'>You&apos;ve checked in {checkIns.length} {pluralize(checkIns.length as number, 'time', 'times')} so far.</p>
            <div className='text-left text-xl text-gray-500 flex flex-col min-w-sm'>
              {checkIns.map((checkIn: any) => (
                <div key={checkIn.id} className='flex flex-items-center border-b border-gray-200 border w-full'>
                  <div className='w-1/4'>
                    {new Date(checkIn.createdAt as Date).toLocaleDateString(locale, dateFormat)}
                  </div>
                  <div className='ml-2'>
                    {checkIn.body} foo
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
  )
}
