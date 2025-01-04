import { loadChallengeSummary } from '~/models/challenge.server'
import { Outlet, useLoaderData, useNavigate, useLocation, useMatches, type MetaFunction } from '@remix-run/react'
import { useContext, useEffect, useState } from 'react'
import { getCurrentUser } from '~/models/auth.server'
import type { MemberChallenge, Challenge, ChallengeSummary } from '~/utils/types'
import { type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { FaChevronCircleLeft } from 'react-icons/fa'
import { prisma } from '~/models/prisma.server'
import ChallengeHeader from '~/components/challengeHeader'
import ChallengeTabs from '~/components/challengeTabs'
import { CurrentUserContext } from '~/utils/CurrentUserContext'

interface ViewChallengeData {
  challenge: ChallengeSummary
  membership?: MemberChallenge | null | undefined
  loadingError?: string
}
interface ChallengeSummaryWithCounts extends ChallengeSummary {
  _count: {
    comments: number
    members: number
    likes: number
  }
}

export const loader: LoaderFunction = async (args: LoaderFunctionArgs): Promise<ViewChallengeData | null | { loadingError: string }> => {
  const currentUser = await getCurrentUser(args)
  const { params } = args
  if (!params.id) {
    return null
  }
  const challenge: ChallengeSummaryWithCounts | undefined = await loadChallengeSummary(params.id)
  if (!challenge) {
    const error = { loadingError: 'Challenge not found' }
    return error
  }
  let membership
  if (currentUser) {
    membership = await prisma.memberChallenge.findFirst({
      where: {
        userId: currentUser ? Number(currentUser.id) : 0,
        challengeId: Number(params.id)
      },
      include: {
        _count: {
          select: { checkIns: true }
        }
      }
    }) as MemberChallenge | null
  }
  return { challenge, membership }
}
export const meta: MetaFunction<typeof loader> = ({
  data
}) => {
  return [{ title: data?.challenge?.name ?? 'Challenge' }]
}
export default function ViewChallenge (): JSX.Element {
  const data = useLoaderData<ViewChallengeData>()
  const { challenge } = data
  const { currentUser } = useContext(CurrentUserContext)
  const [which, setWhich] = useState('') // matches[0] is root, matches[1] is the challenges, matches[2] is challenges/v/$idtab
  const location = useLocation()
  const navigate = useNavigate()
  const matches = useMatches()
  useEffect(() => {
    if (location.pathname.includes('about')) {
      setWhich('about')
    } else if (location.pathname.includes('program')) {
      setWhich('program')
    } else if (location.pathname.includes('checkins')) {
      setWhich('progress')
    } else if (location.pathname.includes('chat')) {
      setWhich('chat')
    }
  }, [])
  const isEdit = location.pathname.includes('edit')
  if (!data) {
    return <p>No data.</p>
  }
  if (data?.loadingError) {
    return <h1>{data.loadingError}</h1>
  }
  if (!data?.challenge) {
    return <p>Loading...</p>
  }
  // force redirect to about tab if no tab is selected
  useEffect(() => {
    if (matches.length === 3) {
      const url = (matches[2].pathname + '/about').replace('//', '/')
      navigate(url)
    }
  }, [matches])
  return (
    <div className={`w-full ${isEdit ? '' : ' relative'}`}>

        <div className='fixed top-0 z-10 bg-white w-full max-w-lg md:max-w-xl bg-opacity-80 rounded-br-lg'>
          <ChallengeHeader challenge={challenge as Challenge} size='small' />
          {!isEdit &&
            <ChallengeTabs challenge={challenge as ChallengeSummary} which={which} isMember={Boolean(data.membership?.id ?? challenge.userId === currentUser?.id)}/>
          }
        </div>

        <div className='mb-16 mt-28 md:mt-24'>
          <Outlet />
        </div>
        <div className='flex items-center md:hidden justify-center w-full my-1'>
          {which !== 'chat' &&
            <FaChevronCircleLeft
              className='w-6 h-6 text-grey cursor-pointer'
              onClick={() => { navigate('/challenges/') }}
            />
          }
        </div>
      </div>
  )
}
