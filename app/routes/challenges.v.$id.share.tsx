import FormNote from '~/components/formNote'
import { type MetaFunction, useNavigate, useRouteLoaderData } from '@remix-run/react'

export const meta: MetaFunction = () => {
  return [
    { title: 'Share Challenge' },
    {
      property: 'og:title',
      content: 'Share Challenge'
    }
  ]
}
export default function ShareChallenge (): JSX.Element {
  const data = useRouteLoaderData('routes/challenges.v.$id')
  const navigate = useNavigate()
  return (
    <div className='md:max-w-lg w-full'>
      <FormNote prompt='Share on your timeline' challenge={data.challenge} onCancel={() => { navigate(-1) }} />
    </div>

  )
}
