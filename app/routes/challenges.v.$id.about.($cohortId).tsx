import ChallengeOverview from '~/components/challengeOverview'
import { type MetaFunction, useRevalidator, useSearchParams } from 'react-router';
import { type Challenge, type ChallengeSummary, type MemberChallenge } from '~/utils/types'
import { useContext, useEffect, useState, useRef, JSX } from 'react'
import { CurrentUserContext } from '~/contexts/CurrentUserContext'
import { useMemberContext } from '~/contexts/MemberContext'
import useCohortId from '~/hooks/useCohortId'
import DialogConfirm from '~/components/dialogConfirm'
import DialogJoin from '~/components/dialogJoin'
import DialogShare from '~/components/dialogShare'
import axios from 'axios'
import { Spinner } from '~/utils/material-tailwind'
import { getShortUrl } from '~/utils/helpers/challenge'
import useGatedNavigate from '~/hooks/useGatedNavigate'

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
  console.log('ABOUT COMPONENT RENDERING')
  
  const { membership, setMembership, challenge: contextChallenge } = useMemberContext()
  const challenge = contextChallenge as ChallengeSummary
  const loadingError = undefined
  const { currentUser } = useContext(CurrentUserContext)
  const navigate = useGatedNavigate()
  const revalidator = useRevalidator()
  const [loading, setLoading] = useState<boolean>(false)
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [showJoin, setShowJoin] = useState<boolean>(false)
  const isMember = () => {return Boolean(membership?.id ?? (challenge?.type === 'SCHEDULED' && challenge?.userId === currentUser?.id))}
  const [searchParams] = useSearchParams()
  const cohortId = useCohortId()
  const [invite, setInvite] = useState<string | null>(searchParams.get('i'))
  useEffect(() => {
    console.log('About title effect running, challenge:', challenge?.name)
    if (challenge?.name) {
      document.title = challenge.name
    }
  }, [challenge])

  const confirmJoinUnjoin = async (): Promise<void> => {
    if (!currentUser) {
      // gateed navigate automatically handles the redirect
      navigate(location.pathname, true)
      return
    }
    if (challenge?.type === 'SELF_LED' && !isMember) {
      setShowJoin(true)
      return
    }
    if (isMember()) {
      setShowConfirm(true)
    } else {
      await toggleJoin()
    }
  }

  const toggleJoin = async (): Promise<void> => {
    if (!challenge?.id) {
      throw new Error('cannot join without an id')
    }
    setLoading(true)
    try {
      const url = `/api/challenges/join-unjoin/${challenge.id as string | number}`
      const response = await axios.post(url)
      if (response.data.result === 'joined') {
      } else {
        if (cohortId) {
          const url = `/challenges/v/${challenge.id}/about`
          navigate(url, true)
        }
      }
      revalidator.revalidate()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }
  const afterJoin = (): void => {
    setShowJoin(false)
    if (cohortId && challenge?.id) {
      navigate(`/challenges/v/${challenge.id}/about/${cohortId}`, true)
    }
    revalidator.revalidate()
  }
  if (!challenge) {
    return <div>Loading...</div>
  }
  if (loadingError) {
    return <div>{loadingError}</div>
  }
  return (
    <div className='w-full mt-28'>
      {invite &&
        <DialogShare
          isOpen={true}
          title='Share this Challenge'
          prompt='Here is a link to invite your friends'
          link={getShortUrl(challenge, membership)}
          onClose={() => { setInvite(null) }}
        />

      }
      <ChallengeOverview challenge={challenge} />
      <div className='max-w-lg text-center rounded-lg p-2'>
      {currentUser?.id === challenge.userId && challenge.type === 'SCHEDULED'
        ? (
        <p className='text-red mt-4'>As the creator of this challenge, you are automatically a member.</p>
          )
        : (
        <button
            onClick={confirmJoinUnjoin}
            className='mt-4  bg-red hover:bg-green-500 text-white rounded-full p-1 px-2 cursor-pointer text-xs'>
              { isMember() ? 'Leave Challenge' : 'Join this Challenge' }
              { loading && <Spinner className='w-4 h-4 inline ml-2' /> }
          </button>

          )}

        <>

          <DialogConfirm
            isOpen={showConfirm}
            onConfirm={toggleJoin}
            onCancel={() => { setShowConfirm(false) }}
            prompt='Are you sure you want to leave this challenge? All your check-ins will be lost.'
          />

          <DialogJoin
            isOpen={showJoin}
            cohortId={cohortId}
            challenge={challenge as Challenge}
            onConfirm={toggleJoin}
            onCancel={() => { setShowJoin(false) }}
            afterJoin={afterJoin}
          />
          {currentUser && challenge.type === 'SCHEDULED' && currentUser.id !== challenge.userId && <div className='mt-4 cursor-pointer text-red text-center text-xs underline' onClick={() => { navigate(`/challenges/v/${challenge.id}/contact`, true) }}>Contact Host</div>}
        </>

      </div>

    </div>
  )
}
