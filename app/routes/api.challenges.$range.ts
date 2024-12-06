import { fetchMemberChallenges } from '~/models/user.server'

import {
  fetchChallengeSummaries,
  fetchUserChallengesAndMemberships
} from '~/models/challenge.server'
import { requireCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction } from '@remix-run/node'

export const loader: LoaderFunction = async (args) => {
  const { range } = args.params ?? 'active'
  console.log('from url', new URL(args.request.url).searchParams.get('SELF_LED'))
  const SELF_LED = new URL(args.request.url).searchParams.get('SELF_LED') === 'true'
  console.log('SELF_LED', SELF_LED)
  const category = new URL(args.request.url).searchParams.get('category')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentUser = await requireCurrentUser(args)
  const uid = Number(currentUser?.id)
  let challenges
  if (range === 'mine') {
    challenges = await fetchUserChallengesAndMemberships({ userId: uid, SELF_LED }) as { error?: string }
  } else {
    if (range === 'all') {
      challenges = await fetchChallengeSummaries({ SELF_LED }) as { error?: string }
    } else {
      challenges = await fetchChallengeSummaries({ userId: uid, range, category, SELF_LED }) as { error?: string }
    }
  }
  if (!challenges || (challenges.error != null)) {
    const error = { loadingError: 'Unable to load challenges' }
    return json(error)
  }
  const memberships = await fetchMemberChallenges(uid) || [] as number[]
  return json({ challenges, memberships, error: null })
}
