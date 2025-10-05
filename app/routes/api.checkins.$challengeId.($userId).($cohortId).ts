import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction } from 'react-router';
import { fetchCheckIns } from '~/models/challenge.server'
import { type CheckIn } from '~/utils/types'
interface LoaderData {
  checkIns: CheckIn[]
}
export const loader: LoaderFunction = async (args): Promise<LoaderData> => {
  await requireCurrentUser(args)
  const userId = Number(args.params.userId ?? undefined)
  const challengeId = Number(args.params.challengeId)
  const cohortId = Number(args.params.cohortId ?? undefined)
  const checkIns = await fetchCheckIns({ userId, challengeId, cohortId })
  return { checkIns }
}
