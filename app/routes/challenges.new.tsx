import { useContext } from 'react'
import ChallengeForm from '~/components/formChallenge'
import { getCurrentUser, requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction } from '@remix-run/node'
import { CurrentUserContext } from '~/contexts/CurrentUserContext'
import type { MetaFunction } from '@remix-run/react'
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

export default function NewChallenge (): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const formData = { userId: currentUser?.id }
  return (
    <ChallengeForm challenge={formData as ChallengeInputs}/>
  )
}
