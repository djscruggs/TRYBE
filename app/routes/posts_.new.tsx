import { requireCurrentUser } from '../models/auth.server'
import getUserLocale from 'get-user-locale'
import { Outlet, useLoaderData } from '@remix-run/react'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import type { ChallengeSummary } from '~/utils/types'
import { useNavigate } from 'react-router-dom'
import { type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { loadChallengeSummary } from '../models/challenge.server'
import FormPost from '../components/formPost'

interface LoaderData {
  challenge: ChallengeSummary | null
  locale: string
};
export const loader: LoaderFunction = async (args: LoaderFunctionArgs): Promise<LoaderData> => {
  const locale = getUserLocale()
  const user = await requireCurrentUser(args)
  const params = args.params
  let challenge = null

  if (params?.challengeId) {
    challenge = await loadChallengeSummary(params.challengeId, !!user?.id)
  }
  return { challenge, locale }
}

export default function PostsNew ({ children }: { children: React.ReactNode }): JSX.Element {
  const data: LoaderData = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const { challenge, locale } = data

  return (
          <>
          {challenge &&
            <p>Post an update for {challenge.name}</p>
          }
          <div className='w-full max-w-lg mt-10'>
            {challenge // only navigate if there is a challenge attached to this post
              ? <FormPost challenge={challenge} locale={locale} onCancel={() => { navigate(-1) }} afterSave={() => { navigate(-1) }}/>
              : <FormPost locale={locale}/>
            }

          </div>
          </>
  )
}
