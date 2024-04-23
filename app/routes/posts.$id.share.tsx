import FormNote from '~/components/formNote'
import { useNavigate, useRouteLoaderData } from '@remix-run/react'

export default function ViewChallengeMembers (): JSX.Element {
  const data = useRouteLoaderData('routes/posts.$id')
  if (!data.post) {
    return <p>Invalid post</p>
  }
  if (!data.post.public) {
    return <p>Non-public posts cannot be shared</p>
  }
  const navigate = useNavigate()
  return (
    <div className='max-w-sm md:max-w-lg mt-10'>
      <FormNote prompt='Share on your timeline' post={data.post} onCancel={() => { navigate(-1) }} afterSave={() => { navigate(-1) }}/>
    </div>

  )
}
