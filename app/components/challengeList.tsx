import CardChallenge from '~/components/cardChallenge'
import { Spinner } from '@material-tailwind/react'
import {
  type ChallengeSummary,
  type MemberChallenge,
  type Like
} from '~/utils/types'

interface ChallengeListProps {
  challenges: ChallengeSummary[]
  memberships: MemberChallenge[]
  isLoading: boolean
  likes: Like[]
}
export default function ChallengeList ({ challenges, memberships, isLoading, likes }: ChallengeListProps): JSX.Element {
  function isMember (challenge: ChallengeSummary): boolean {
    return memberships.some((membership: MemberChallenge) => membership.challengeId === challenge.id)
  }
  return (
          <div className="w-full h-full flex-cols justify-center items-center">

            {isLoading
              ? <div className="mt-8 w-full flex items-center justify-center">
                  <Spinner className="h-4 w-4" />
                </div>

              : challenges?.length > 0 &&
              challenges.map((challenge: ChallengeSummary) => (
                <div key={challenge.id} className="w-full mb-4">
                  <CardChallenge challenge={challenge} isMember={isMember(challenge)} />
                 </div>
              ))
            }
    </div>
  )
}
