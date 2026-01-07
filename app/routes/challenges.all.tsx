import { type JSX } from 'react'
import { Spinner } from '~/components/ui/spinner'
import ChallengeList from '~/components/challengeList'
import {
  type MetaFunction,
  type LoaderFunctionArgs,
  useLoaderData,
  redirect
} from 'react-router'
import type { ChallengeSummary } from '~/utils/types'
import { getCurrentUser } from '~/models/auth.server'
import { fetchChallengeSummaries } from '~/models/challenge.server'

export const meta: MetaFunction = () => {
  return [
    { title: 'All Challenges' },
    {
      property: 'og:title',
      content: 'Challenge Templates'
    }
  ]
}

export async function loader(args: LoaderFunctionArgs) {
  const currentUser = await getCurrentUser(args)

  if (currentUser?.role !== 'ADMIN') {
    return redirect('/')
  }
  // Call the function directly instead of making an API fetch
  const data = await fetchChallengeSummaries({ range: 'all' })
  return {
    challenges: data.challenges as ChallengeSummary[],
    memberships: []
  }
}

interface LoaderData {
  challenges: ChallengeSummary[]
  memberships: any[]
}

export default function ChallengesAll(): JSX.Element {
  const { challenges, memberships } = useLoaderData<LoaderData>()

  return (
    <>
      <div className="flex items-center  max-w-xl mt-14">
        <div className="flex flex-col items-center max-w-lg w-full">
          <h1 className="text-3xl font-bold mb-4 w-full ml-2 md:ml-0">
            All Challenges
          </h1>
          {challenges.length > 0 && (
            <ChallengeList
              challenges={challenges}
              memberships={memberships}
              isLoading={false}
            />
          )}
          {challenges.length === 0 && (
            <p className="text-gray-500 mt-4">No challenges found.</p>
          )}
        </div>
      </div>
    </>
  )
}
