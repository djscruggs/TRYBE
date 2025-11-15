import { loadChallengeSummary } from '~/models/challenge.server'
import { type ChallengeSummary } from '~/utils/types'
import { type LoaderFunction, type LoaderFunctionArgs } from 'react-router'

export const loader: LoaderFunction = async (
  args: LoaderFunctionArgs
): Promise<ChallengeSummary | null | { error: string }> => {
  const { params } = args
  if (!params.id) {
    return null
  }
  const challenge: ChallengeSummary | undefined = await loadChallengeSummary(
    params.id
  )
  if (!challenge) {
    const error = { error: 'Challenge not found' }
    return error
  }
  return challenge
}
