import { loadChallengeSummary } from '~/models/challenge.server'
import {
  Outlet,
  useLoaderData,
  useNavigate,
  useLocation,
  useMatches,
  type MetaFunction,
  useSearchParams,
} from 'react-router';
import { useEffect, useState, JSX, useCallback } from 'react'
import { requireAdminOrValidCohortMembership } from '~/models/auth.server'
import type { MemberChallenge, Challenge, ChallengeSummary } from '~/utils/types'
import { type LoaderFunction, type LoaderFunctionArgs } from 'react-router';
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
  console.log('Parent loader called')
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
    console.log('bottom')
    return { challenge, membership: membership ?? null, cohortId }
  } catch (error) {
    console.log('error')
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
  
  // Dummy setters to satisfy the context
  const setMembership = () => {}
  const setChallenge = () => {}

  const location = useLocation()
  const navigate = useNavigate()
  const currentTab = location.pathname.split('/').pop()
  const isEdit = location.pathname.includes('edit')

  // force redirect to about tab if no tab is selected
  useEffect(() => {
    const currentPath = location.pathname
    const hasTab = currentPath.includes('/about') || currentPath.includes('/chat') ||
                   currentPath.includes('/checkins') || currentPath.includes('/members') ||
                   currentPath.includes('/program')

    
    // Only redirect if we're exactly on /challenges/v/:id without a tab
    if (!hasTab && data?.challenge?.id) {
      const url = `/challenges/v/${data.challenge.id}/about`
      navigate(url, { replace: true })
    }
  }, [location.pathname])
  return (
    <MemberContextProvider membership={data.membership as MemberChallenge | null} setMembership={setMembership} challenge={data.challenge as Challenge | null} setChallenge={setChallenge}>
      { !data?.challenge && !data.loadingError && <p>Loading...</p>}

      { data?.loadingError && <h1 className='mt-10 text-2xl text-red'>{data.loadingError}</h1>}

      { !data?.loadingError && data?.challenge && (
        <div className={`w-full ${isEdit ? '' : ' relative'}`}>
          {/* make wider on chat tab */}
          <div className={`fixed top-0 z-10 bg-white w-full max-w-lg ${currentTab === 'chat' ? 'md:max-w-2xl' : ''} bg-opacity-80 rounded-br-lg`}>
            <ChallengeHeader challenge={data.challenge!} size='small' />
            {!isEdit &&
              <ChallengeTabs challenge={data.challenge as ChallengeSummary} />
            }
          </div>
          <div className='mb-16 mt-24'>
            <Outlet />
          </div>
          <div className='flex items-center md:hidden justify-center w-full my-1'>
            {currentTab !== 'chat' &&
              <FaChevronCircleLeft
                className='w-6 h-6 text-grey cursor-pointer'
                onClick={() => { navigate('/challenges/') }}
              />
            }
          </div>
        </div>
      )}
    </MemberContextProvider>
  )
}
