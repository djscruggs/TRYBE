import { fetchMemberChallenges } from '~/models/user.server'

import {
  fetchChallengeSummaries,
  fetchUserChallengesAndMemberships
} from '~/models/challenge.server'
import { getCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction } from '@remix-run/node'

export const loader: LoaderFunction = async (args) => {
  const { range = 'active' } = args.params
  const url = new URL(args.request.url)
  const type = url.searchParams.get('type') ?? 'all'
  const category = url.searchParams.get('category')

  const currentUser = await getCurrentUser(args)
  const userId = currentUser?.id ? Number(currentUser.id) : null
  let challenges
  if (range === 'mine') {
    challenges = await fetchUserChallengesAndMemberships({ userId }) as { error?: string }
  } else {
    challenges = await fetchChallengeSummaries({ range, category, type }) as { error?: string }
  }

  if (!challenges || challenges.error) {
    return json({ loadingError: 'Unable to load challenges' })
  }

  const memberships = await fetchMemberChallenges(userId) || [] as number[]
  return json({ challenges, memberships, error: null })
}
