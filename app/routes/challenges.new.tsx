import { useContext, type JSX } from 'react'
import ChallengeForm from '~/components/formChallenge'
import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction, type MetaFunction } from 'react-router'
import { CurrentUserContext } from '~/contexts/CurrentUserContext'
import type { ChallengeInputs } from '~/utils/types'
export const meta: MetaFunction = () => {
  return [
    { title: 'Create Challenge' },
    {
      property: 'og:title',
      content: 'Create Challenge'
    }
  ]
}
interface LoaderData {
  locale?: string
}
export const loader: LoaderFunction = async (args): Promise<LoaderData> => {
  await requireCurrentUser(args)
  return {}
}

export default function NewChallenge(): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const formData: Partial<ChallengeInputs> = {
    userId: currentUser?.id || 0,
    categories: [],
    type: 'SCHEDULED',
    status: 'DRAFT',
    frequency: 'DAILY',
    public: true
  }
  return (
    <div className="mt-12">
      <ChallengeForm challenge={formData as ChallengeInputs} />
    </div>
  )
}
