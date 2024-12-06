import { useContext } from 'react'
import ChallengeForm from '~/components/formChallenge'
import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction } from '@remix-run/node'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import type { MetaFunction } from '@remix-run/react'
export const meta: MetaFunction = () => {
  return [
    { title: 'Create Challenge Template' },
    {
      property: 'og:title',
      content: 'Create Challenge Template'
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

export default function NewChallengeTemplate (): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const formData = { userId: currentUser?.id }
  return (
    <ChallengeForm challenge={formData}/>
  )
}