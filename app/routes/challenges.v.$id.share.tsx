import FormNote from '~/components/formNote'
import { useNavigate, useRouteLoaderData } from '@remix-run/react'

export default function ViewChallengeMembers (): JSX.Element {
  const data = useRouteLoaderData('routes/challenges.v.$id')
  const navigate = useNavigate()
  return (
    <div className='md:max-w-lg w-full'>
      <FormNote prompt='Share on your timeline' challenge={data.challenge} onCancel={() => { navigate(-1) }} />
    </div>

  )
}
