import {
  useRouteLoaderData,
  useNavigate
} from '@remix-run/react'
import type { PostSummary } from '~/utils/types'
import FormPost from '~/components/formPost'
export default function EditPost (): JSX.Element {
  const { post } = useRouteLoaderData<typeof useRouteLoaderData>('routes/posts.$id') as { post: PostSummary }
  const navigate = useNavigate()
  return (
    <div className='flex flex-col'>
      <div className='max-w-sm md:m ax-w-md lg:max-w-lg relative'>
        <FormPost post={post} onCancel={() => { navigate(-1) }} afterSave={() => { navigate(-1) }} />
      </div>
    </div>
  )
}
