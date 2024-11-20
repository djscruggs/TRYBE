import { fetchMemberChallenges } from '~/models/user.server'

import {
  fetchChallengeSummaries,
  fetchUserChallengesAndMemberships
} from '~/models/challenge.server'
import { requireCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction } from '@remix-run/node'

export const loader: LoaderFunction = async (args) => {
  const { status } = args.params ?? 'active'
  const category = new URL(args.request.url).searchParams.get('category')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentUser = await requireCurrentUser(args)
  const uid = Number(currentUser?.id)
  let challenges
  if (status === 'mine') {
    challenges = await fetchUserChallengesAndMemberships(uid) as { error?: string }
  } else {
    if (status === 'all') {
      challenges = await fetchChallengeSummaries() as { error?: string }
    } else {
      challenges = await fetchChallengeSummaries(undefined, status, category) as { error?: string }
    }
  }
  if (!challenges || (challenges.error != null)) {
    const error = { loadingError: 'Unable to load challenges' }
    return json(error)
  }
  const memberships = await fetchMemberChallenges(uid) || [] as number[]
  return json({ challenges, memberships, error: null })
}
