import type { MemberChallenge } from '~/utils/types'
import { type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { getCurrentUser } from '~/models/auth.server'
import { loadMemberChallenge } from '~/models/challenge.server'

export const loader: LoaderFunction = async (args: LoaderFunctionArgs): Promise<{ membership: MemberChallenge | null }> => {
  const currentUser = await getCurrentUser(args)
  const { params } = args
  if (!params.id || !currentUser) {
    return { membership: null }
  }
  const membership = await loadMemberChallenge(currentUser.id, Number(params.id))
  return { membership }
}
