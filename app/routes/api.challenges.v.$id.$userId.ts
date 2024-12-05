import {
  loadChallenge
} from '~/models/challenge.server'
import { requireCurrentUser } from '~/models/auth.server'
import { type ChallengeSummary } from '~/utils/types'
import { type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'

export const loader: LoaderFunction = async (args: LoaderFunctionArgs): Promise<ChallengeSummary | null | { error: string }> => {
  await requireCurrentUser(args)
  const { params } = args
  if (!params.id) {
    return null
  }
  const challenge: ChallengeSummary | undefined = await loadChallenge(params.id, params.userId)
  if (!challenge) {
    const error = { error: 'Challenge not found' }
    return error
  }
  return challenge
}
