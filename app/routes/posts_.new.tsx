import { requireCurrentUser } from '../models/auth.server'
import { Outlet, useLoaderData } from '@remix-run/react'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import type { ChallengeSummary } from '~/utils/types'
import { useNavigate } from 'react-router-dom'
import { type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { loadChallengeSummary } from '../models/challenge.server'
import FormPost from '../components/formPost'

interface LoaderData {
  challenge: ChallengeSummary | null
};
export const loader: LoaderFunction = async (args: LoaderFunctionArgs): Promise<LoaderData> => {
  const user = await requireCurrentUser(args)
  const params = args.params
  let challenge = null

  if (params?.challengeId) {
    challenge = await loadChallengeSummary(params.challengeId, !!user?.id)
  }
  return { challenge }
}

export default function PostsNew ({ children }: { children: React.ReactNode }): JSX.Element {
  const data = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const challenge = (data as LoaderData)?.challenge
  const afterSave = (): void => {
    navigate(-1)
  }

  return (
          <>
          {challenge &&
            <p>Post an update for {challenge.name}</p>
          }
          <div className='w-full max-w-lg mt-10'>
            <FormPost challenge={challenge} onCancel={afterSave} afterSave={afterSave}/>
          </div>
          </>
  )
}
