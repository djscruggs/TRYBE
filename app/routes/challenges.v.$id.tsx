import { loadChallengeSummary } from '~/models/challenge.server'
import { Outlet, useLoaderData, useNavigate, useLocation, useMatches, type MetaFunction, useSearchParams } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { requireAdminOrValidCohortMembership } from '~/models/auth.server'
import type { MemberChallenge, Challenge, ChallengeSummary } from '~/utils/types'
import { type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { FaChevronCircleLeft } from 'react-icons/fa'
import { prisma } from '~/models/prisma.server'
import ChallengeHeader from '~/components/challengeHeader'
import ChallengeTabs from '~/components/challengeTabs'
import { MemberContextProvider } from '~/contexts/MemberContext'

interface ViewChallengeData {
  challenge: ChallengeSummary
  membership?: MemberChallenge | null
  loadingError?: string
  cohortId?: number
}
interface ChallengeSummaryWithCounts extends ChallengeSummary {
  _count: {
    comments: number
    members: number
    likes: number
  }
}

export const loader: LoaderFunction = async (args: LoaderFunctionArgs): Promise<ViewChallengeData | null | Response | { loadingError: string }> => {
  const currentUser = await requireAdminOrValidCohortMembership(args)
  // Check if currentUser is a redirect response
  if (currentUser instanceof Response) {
    return currentUser
  }
  try {
    const { params } = args
    const cohortId = params.cohortId ? Number(params.cohortId) : undefined
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
          },
          challenge: true
        }
      }) as MemberChallenge | null
    }
    return { challenge, membership: membership ?? null, cohortId }
  } catch (error) {
    console.error(error)
    return { loadingError: 'Error loading challenge' }
  }
}
export const meta: MetaFunction<typeof loader> = ({
  data
}) => {
  return [{ title: data?.challenge?.name ?? 'Challenge' }]
}
export default function ViewChallenge (): JSX.Element {
  const data = useLoaderData<ViewChallengeData>()
  const [membership, setMembership] = useState<MemberChallenge | null>(data.membership as MemberChallenge | null)
  const { challenge } = data
  const [which, setWhich] = useState('') // matches[0] is root, matches[1] is the challenges, matches[2] is challenges/v/$idtab
  const location = useLocation()
  const navigate = useNavigate()
  const matches = useMatches()
  useEffect(() => {
    let isChat = false
    if (location.pathname.includes('about')) {
      setWhich('about')
    } else if (location.pathname.includes('program')) {
      setWhich('program')
    } else if (location.pathname.includes('checkins')) {
      setWhich('progress')
    } else if (location.pathname.includes('chat')) {
      setWhich('chat')
      isChat = true
    }
    if (!isChat) {
      window.scrollTo(0, 0) // Scroll to the top of the page
    }
  }, [location.pathname])
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
    <MemberContextProvider membership={membership} setMembership={setMembership}>
      <div className={`w-full ${isEdit ? '' : ' relative'}`}>
        {/* make wider on chat tab */}
        <div className={`fixed top-0 z-10 bg-white w-full max-w-lg ${which === 'chat' ? 'md:max-w-2xl' : ''} bg-opacity-80 rounded-br-lg`}>
          <ChallengeHeader challenge={challenge as Challenge} size='small' />
          {!isEdit &&
            <ChallengeTabs challenge={challenge as ChallengeSummary} which={which} />
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
    </MemberContextProvider>
  )
}
