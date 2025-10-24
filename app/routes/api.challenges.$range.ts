import { fetchMemberChallenges } from '~/models/user.server'

import {
  fetchChallengeSummaries,
  fetchUserChallengesAndMemberships
} from '~/models/challenge.server'
import { getCurrentUser } from '~/models/auth.server'
import { type LoaderFunction  } from 'react-router';

export const loader: LoaderFunction = async (args) => {
  const { range = 'active' } = args.params
  const url = new URL(args.request.url)
  const type = url.searchParams.get('type') ?? 'all'
  const category = url.searchParams.get('category')

  console.log('API route called with range:', range, 'type:', type, 'category:', category)
  
  const currentUser = await getCurrentUser(args)
  const userId = currentUser?.id ? Number(currentUser.id) : null
  
  console.log('Current user:', currentUser ? 'authenticated' : 'not authenticated', 'userId:', userId)
  let challenges
  let error = null
  if (range === 'mine') {
    challenges = await fetchUserChallengesAndMemberships({ userId }) as { error?: string }
  } else {
    if (range === 'all' && currentUser?.role === 'ADMIN') {
      challenges = await fetchChallengeSummaries({ range, category, type }) as { error?: string }
    } else {
      if (range === 'all') {
        error = 'Range `all` called by non-admin user, returning upcoming, active'
        console.error(error)
        challenges = await fetchChallengeSummaries({ range: 'upcoming,active', category, type }) as { error?: string }
      } else {
        challenges = await fetchChallengeSummaries({ range, category, type }) as { error?: string }
      }
    }
  }

  if (!challenges || challenges.error) {
    return Response.json({ loadingError: 'Unable to load challenges' })
  }

  const memberships = (await fetchMemberChallenges(userId)) || [] as number[]
  return Response.json({ challenges, memberships, error })
}
