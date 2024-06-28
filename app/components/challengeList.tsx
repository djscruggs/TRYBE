import CardChallenge from '~/components/cardChallenge'
import {
  type Challenge,
  type ChallengeSummary,
  type MemberChallenge
} from '~/utils/types'

interface ChallengeListProps {
  challenges: Challenge[] | ChallengeSummary[]
  memberships: MemberChallenge[]
}
export default function ChallengeList ({ challenges, memberships }: ChallengeListProps): JSX.Element {
  function isMember (challenge: Challenge | ChallengeSummary): boolean {
    return memberships.some((membership: MemberChallenge) => membership.challengeId === challenge.id)
  }
  return (
          <div className="w-full">
            {challenges?.length > 0 &&
              challenges.map((challenge: any) => (
                <div key={challenge.id} className="w-full">
                  <CardChallenge challenge={challenge} isMember={isMember(challenge)} />
                </div>
              ))
            }
          </div>
  )
}
