import { requireCurrentUser } from '../models/auth.server'
import { useLoaderData } from '@remix-run/react'
import type { ChallengeSummary } from '~/utils/types'
import { useNavigate } from 'react-router-dom'
import { type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { loadChallengeSummary } from '../models/challenge.server'
import FormThread from '../components/formThread'

interface LoaderData {
  challenge: ChallengeSummary
};
export const loader: LoaderFunction = async (args: LoaderFunctionArgs): Promise<LoaderData> => {
  const user = await requireCurrentUser(args)
  const params = args.params
  const challenge = await loadChallengeSummary(params.challengeId, user?.id)
  return { challenge }
}

export default function ThreadNew (): JSX.Element {
  const { challenge } = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  return (
          <div className='w-full max-w-lg mt-10'>
            <p className='mb-4'>Start a discussion thread for <span className='font-bold'>{challenge.name}</span></p>
            <FormThread challenge={challenge} onCancel={() => { navigate(-1) }} afterSave={() => { navigate(-1) }}/>
          </div>
  )
}
