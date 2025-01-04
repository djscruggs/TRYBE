import ChallengeOverview from '~/components/challengeOverview'
import { type MetaFunction, useRouteLoaderData, useNavigate, useRevalidator, useSearchParams } from '@remix-run/react'
import { type Challenge, type ChallengeSummary, type MemberChallenge } from '~/utils/types'
import { useContext, useState } from 'react'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import DialogConfirm from '~/components/dialogConfirm'
import DialogJoin from '~/components/dialogJoin'
import DialogShare from '~/components/dialogShare'
import { isPast } from 'date-fns'
import axios from 'axios'
import Spinner from '@material-tailwind/react/components/Spinner'
import { challengeIsExpired } from '~/utils/helpers'

export const meta: MetaFunction = () => {
  return [
    { title: 'About this Challenge' },
    {
      property: 'og:title',
      content: 'About this Challenge'
    }
  ]
}
export default function ChallengeAbout (): JSX.Element {
  const data = useRouteLoaderData<{ challenge: ChallengeSummary, membership: MemberChallenge }>('routes/challenges.v.$id') as unknown as { challenge: ChallengeSummary, membership: MemberChallenge }
  const { challenge } = data
  const { currentUser } = useContext(CurrentUserContext)
  const navigate = useNavigate()
  const revalidator = useRevalidator()
  const [loading, setLoading] = useState<boolean>(false)
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [showJoin, setShowJoin] = useState<boolean>(false)
  const [isMember, setIsMember] = useState<boolean>(Boolean(data.membership?.id ?? challenge?.userId === currentUser?.id))
  const [membership, setMembership] = useState<MemberChallenge | undefined>(data.membership)
  const isExpired = challengeIsExpired(challenge, membership)
  const [searchParams] = useSearchParams()
  const [invite, setInvite] = useState<string | null>(searchParams.get('i'))

  const confirmJoinUnjoin = async (): Promise<void> => {
    if (!currentUser) {
      const redirectTo = location.pathname
      localStorage.setItem('redirectTo', redirectTo)
      navigate(`/signup?redirectTo=${redirectTo}`)
      return
    }
    if (challenge.type === 'SELF_LED' && !isMember) {
      setShowJoin(true)
      return
    }
    if (isMember) {
      setShowConfirm(true)
    } else {
      await toggleJoin()
    }
  }
  const getFullUrl = (): string => {
    return `${window.location.origin}/challenges/v/${challenge.id}`
  }
  const getShortUrl = (): string => {
    return `${window.location.origin}/s/c${challenge.id}`
  }

  const toggleJoin = async (): Promise<void> => {
    if (!challenge?.id) {
      throw new Error('cannot join without an id')
    }
    setLoading(true)

    const url = `/api/challenges/join-unjoin/${challenge.id as string | number}`
    const response = await axios.post(url)
    if (response.data.result === 'joined') {
      setIsMember(true)
      setMembership(response.data.result as MemberChallenge)
    } else {
      setIsMember(false)
    }
    setLoading(false)
    setShowConfirm(false)
    revalidator.revalidate()
  }
  const afterJoin = (isMember: boolean, membership?: MemberChallenge): void => {
    setIsMember(isMember)
    setMembership(membership)
    setShowJoin(false)
    revalidator.revalidate()
  }
  if (!challenge) {
    return <div>Loading...</div>
  }
  return (
    <div className='w-full'>
      {invite &&
        <DialogShare
          isOpen={true}
          title='Share this Challenge'
          prompt='Here is a link to invite your friends'
          link={getShortUrl()}
          onClose={() => { setInvite(null) }}
        />

      }
      <ChallengeOverview challenge={challenge} memberChallenge={membership}/>
      <div className='max-w-lg text-center rounded-lg p-2'>
      {currentUser?.id === challenge.userId && (
        <p className='text-red mt-4'>As the creator of this challenge, you are automatically a member.</p>
      )}
      {currentUser?.id !== challenge.userId && (
        <>
        <button
            onClick={confirmJoinUnjoin}
            className='mt-4  bg-red hover:bg-green-500 text-white rounded-full p-1 px-2 cursor-pointer text-xs'>
              { isMember ? 'Leave Challenge' : 'Join this Challenge' }
              { loading && <Spinner className='w-4 h-4 inline ml-2' /> }
          </button>
          <DialogConfirm
            isOpen={showConfirm}
            onConfirm={toggleJoin}
            onCancel={() => { setShowConfirm(false) }}
            prompt='Are you sure you want to leave this challenge? All your check-ins will be lost.'
          />

          <DialogJoin
            isOpen={showJoin}
            challenge={challenge as Challenge}
            onConfirm={toggleJoin}
            onCancel={() => { setShowJoin(false) }}
            afterJoin={afterJoin}
          />
        {currentUser && challenge.type === 'SCHEDULED' && <div className='mt-4 cursor-pointer text-red text-center text-xs underline' onClick={() => { navigate(`/challenges/v/${challenge.id}/contact`) }}>Contact Host</div>}
        </>

      )}

      </div>

    </div>
  )
}
