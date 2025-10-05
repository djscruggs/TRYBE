import { loadPostSummary } from '~/models/post.server'
import { Outlet, useLoaderData, useLocation } from 'react-router';
import CardPost from '~/components/cardPost'
import ChallengeHeader from '~/components/challengeHeader'
import { requireCurrentUser } from '~/models/auth.server'
import type { ChallengeSummary, MemberChallenge, PostSummary } from '~/utils/types'
import { json, type LoaderFunction, type LoaderFunctionArgs } from 'react-router';
import MobileBackButton from '~/components/mobileBackButton'
import ChallengeTabs from '~/components/challengeTabs'
import { loadChallengeSummary, loadMemberChallenge } from '~/models/challenge.server'
import { useContext } from 'react'
import { CurrentUserContext } from '~/contexts/CurrentUserContext'
export interface PostData {
  post: PostSummary | null
  challenge?: ChallengeSummary | null
  membership?: MemberChallenge | null
  loadingError?: string
}

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  const currentUser = await requireCurrentUser(args)
  const { params } = args
  if (!params.id) {
    return null
  }
  const post = await loadPostSummary(params.id) as PostSummary | null
  // error if no post OR it's not a preview by the user who created it
  if (!post || (!post.published && post.userId !== currentUser?.id && currentUser?.role !== 'ADMIN')) {
    const error = { loadingError: 'Post not found' }
    return json(error)
  }
  const challenge = await loadChallengeSummary(post?.challengeId ?? 0) as ChallengeSummary | null
  const membership = await loadMemberChallenge(currentUser?.id ?? 0, post?.challengeId ?? 0)
  return json({ post, challenge, membership })
}

export default function ViewPost (): JSX.Element {
  const location = useLocation()
  if (location.pathname.includes('edit')) {
    return <Outlet />
  }
  const { loadingError, post, challenge } = useLoaderData() as PostData
  if (loadingError) {
    return <h1>{loadingError}</h1>
  }
  if (!post) {
    return <p>Loading...</p>
  }
  return (
    <>
      {challenge &&
        <div className='fixed top-0 z-10 bg-white w-full max-w-lg bg-opacity-80 rounded-br-lg'>
          <ChallengeHeader size='small' challenge={challenge} />
          <ChallengeTabs challenge={challenge} which='posts'/>
        </div>
      }
      <div className={`w-screen px-4 md:px-0 md:max-w-xl ${post.challenge ? 'mt-24' : 'mt-10'}`}>
        <CardPost post={post} fullPost={true} hideMeta={true} />
      </div>
      <Outlet context={{ post }} />
      <MobileBackButton />
    </>
  )
}
