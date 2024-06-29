import { requireCurrentUser } from '../models/auth.server'
import { type LoaderFunction, json } from '@remix-run/node'
import { useLoaderData, useMatches } from '@remix-run/react'
import { useContext } from 'react'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import { fetchCheckIns } from '~/models/challenge.server'
import { type Challenge } from '~/utils/types'
import { userLocale } from '~/utils/helpers'
import { differenceInDays, format } from 'date-fns'

export const loader: LoaderFunction = async (args) => {
  const currentUser = await requireCurrentUser(args)
  const userId = Number(args.params.userId ?? currentUser?.id)
  const challengeId = Number(args.params.id)
  const checkIns = await fetchCheckIns(userId, challengeId) as { error?: string }
  return json({ checkIns })
}
export default function CheckIns (): JSX.Element {
  const data: any = useLoaderData()
  const { checkIns } = useLoaderData<typeof loader>()
  const matches = useMatches()
  const { challenge } = matches.find((match) => match.id === 'routes/challenges.v.$id')?.data as { challenge: Challenge }
  const numDays = differenceInDays(challenge.endAt, challenge.startAt)
  const { currentUser } = useContext(CurrentUserContext)
  const locale = userLocale(currentUser)
  const dateFormat = {
    month: 'long',
    day: 'numeric'
  }
  if (data?.error) {
    return <h1>{data.error}</h1>
  }
  if (!data) {
    return <p>Loading...</p>
  }
  return (
        <div className=' max-w-sm md:max-w-xl lg:max-w-2xl mt-10'>
          <div>
            {checkIns.length} check ins of {numDays} days total
            </div>
          {checkIns.map((checkIn: any) => (
            <div key={checkIn.id}>
              {new Date(checkIn.createdAt as Date).toLocaleDateString(locale, dateFormat)}
            </div>
          ))}
        </div>
  )
}
