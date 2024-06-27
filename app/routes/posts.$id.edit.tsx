import {
  useMatches,
  useNavigate
} from '@remix-run/react'
import FormPost from '~/components/formPost'
export default function EditPost (): JSX.Element {
  const matches = useMatches()
  const { post } = matches.find((match) => match.id === 'routes/posts.$id')?.data as ObjectData
  const navigate = useNavigate()
  return (
    <div className='flex flex-col'>
      <div className='max-w-sm md:m ax-w-md lg:max-w-lg relative'>
        <FormPost post={post} onCancel={() => { navigate(-1) }} afterSave={() => { navigate(-1) }} />
      </div>
    </div>
  )
}
