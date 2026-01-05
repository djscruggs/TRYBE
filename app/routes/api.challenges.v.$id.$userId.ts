import { loadChallenge } from '~/models/challenge.server'
import { requireCurrentUser } from '~/models/auth.server'
import { type ChallengeSummary } from '~/utils/types'
import { type LoaderFunction, type LoaderFunctionArgs } from 'react-router'

export const loader: LoaderFunction = async (
  args: LoaderFunctionArgs
): Promise<Response> => {
  await requireCurrentUser(args)
  const { params } = args
  if (!params.id) {
    return Response.json({ error: 'Challenge ID is required' }, { status: 400 })
  }
  const challenge: ChallengeSummary | null = await loadChallenge(
    Number(params.id),
    params.userId ? Number(params.userId) : undefined
  )
  if (!challenge) {
    return Response.json({ error: 'Challenge not found' }, { status: 404 })
  }
  return Response.json(challenge)
}
