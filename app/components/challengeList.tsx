import CardChallengeHome from '~/components/cardChallengeHome'
import { Spinner } from '@material-tailwind/react'
import {
  type ChallengeSummary,
  type MemberChallenge
} from '~/utils/types'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { useContext } from 'react'
interface ChallengeListProps {
  challenges: ChallengeSummary[]
  memberships: MemberChallenge[]
  isLoading: boolean
}
export default function ChallengeList ({ challenges, memberships, isLoading }: ChallengeListProps): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  function isMember (challenge: ChallengeSummary): boolean {
    return memberships.some((membership: MemberChallenge) => membership.challengeId === challenge.id) || challenge.userId === currentUser?.id
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
                  <CardChallengeHome challenge={challenge} isMember={isMember(challenge)} />
                 </div>
              ))
            }
    </div>
  )
}
