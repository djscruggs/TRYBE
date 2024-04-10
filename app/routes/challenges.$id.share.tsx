
import FormNote from '~/components/formNote'
import CardChallenge from '~/components/cardChallenge'
import { useNavigate, useRouteLoaderData } from '@remix-run/react'

export default function ViewChallengeMembers (): JSX.Element {
  const data = useRouteLoaderData('routes/challenges.$id')
  const navigate = useNavigate()
  return (
    <div className='max-w-sm'>
      <FormNote prompt='Share on your timeline' challenge={data.challenge} onCancel={() => { navigate(-1) }} afterSave={() => { navigate(-1) }}/>
    </div>

  )
}
