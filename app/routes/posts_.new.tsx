import { requireCurrentUser } from '../models/auth.server'
import { useLoaderData, useSearchParams, useLocation } from '@remix-run/react'
import type { ChallengeSummary, Post, PostSummary } from '~/utils/types'
import { useNavigate } from 'react-router-dom'
import { type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { loadChallengeSummary } from '../models/challenge.server'
import FormPost from '../components/formPost'
import ChallengeHeader from '~/components/challengeHeader'
interface LoaderData {
  challenge: ChallengeSummary | null
};
export const loader: LoaderFunction = async (args: LoaderFunctionArgs): Promise<LoaderData> => {
  const user = await requireCurrentUser(args)
  const params = args.params
  let challenge = null

  if (params?.challengeId) {
    challenge = await loadChallengeSummary(params.challengeId, !!user?.id)
  }
  return { challenge }
}

interface PostsNewProps {
  afterSave?: (post: Post | PostSummary) => void
}

export default function PostsNew (props: PostsNewProps): JSX.Element {
  const data: LoaderData = useLoaderData<typeof loader>()
  const { afterSave } = props
  const navigate = useNavigate()
  const { challenge } = data
  const location = useLocation()
  const publishAt = location.state?.publishAt ?? null
  const title = location.state?.title ?? null

  const afterSaveCallback = (post: Post | PostSummary): void => {
    if (afterSave) {
      afterSave(post)
    } else {
      navigate(-1)
    }
  }
  return (
          <>
          {challenge &&
            <ChallengeHeader challenge={challenge} size='small' />
          }
          <div className='w-full max-w-lg mt-10'>
            {challenge // only navigate if there is a challenge attached to this post
              ? <FormPost
                    challenge={challenge}
                    onCancel={() => { navigate(-1) }}
                    afterSave={afterSaveCallback}
                    publishAt={publishAt}
                    title={title}
                  />
              : <FormPost
                  publishAt={publishAt}
                  title={title}
                  />
            }

          </div>
          </>
  )
}
