import React, { useContext } from 'react'
import { useNavigate } from '@remix-run/react'
import {
  Card,
  Button
} from '@material-tailwind/react'
import { type Challenge, type MemberChallenge } from '~/utils/types'
import { CurrentUserContext } from '~/contexts/CurrentUserContext'
import { userLocale } from '~/utils/helpers'
import ShareMenu from './shareMenu'

interface CardChallengeProps {
  membership: MemberChallenge
}

export default function CardChallengeMembership ({ membership }: CardChallengeProps): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const navigate = useNavigate()
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const challenge: Challenge = membership.challenge!
  const goToChallenge = (): void => {
    if (challenge) {
      const url = `/challenges/v/${challenge.id}`
      navigate(url)
    }
  }
  const getFullUrl = (): string => {
    return `${window.location.origin}/challenges/v/${challenge.id}`
  }
  const locale = userLocale(currentUser)

  return (
    <div className="mt-2 border-0 drop-shadow-none mr-2 w-full cursor-pointer">
      <div className="drop-shadow-none">
        <div className={'grid grid-cols-1 md:grid-cols-2 gap-4 rounded-md p-1 bg-white'}>
          <Card onClick={goToChallenge} className='md:col-span-2 bg-gray-200 p-2 border-1 drop-shadow-lg border-gray rounded-md'>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col justify-center items-center col-span-1">
                  <div className="flex flex-col items-center col-span-2">
                    Member since: {new Date(membership.createdAt).toLocaleDateString(locale)}
                  </div>
              </div>
              <div className="flex flex-col items-center col-span-2">
                <div className='mt-2 font-bold'>{challenge.name}</div>
                <Button onClick={goToChallenge} className='bg-red p-3 py-2 rounded-full mt-3 text-white'>Check In</Button>
              </div>
            </div>
          </Card>
        </div>
        {/* <span className="text-xs text-gray-500">2 hours ago</span> */}
      </div>
      {challenge.public &&
      <>
        <div className="flex justify-end pr-2 mt-2">
              <ShareMenu copyUrl={getFullUrl()} itemType='challenge' itemId={challenge.id}/>

        </div>
      </>
      }
    </div>
  )
}
