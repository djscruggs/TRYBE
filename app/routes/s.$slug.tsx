import { useNavigate, useParams } from '@remix-run/react'
import { useEffect } from 'react'
import { Spinner } from '@material-tailwind/react'
interface ShareProps {
  slug: string
}
export default function Share (props: ShareProps): JSX.Element {
  const params = useParams()
  const slug = props.slug ?? params.slug
  const stripped = slug.substring(1)
  const [id, cohortId] = stripped.includes('-') ? stripped.split('-') : [stripped, null]
  const navigate = useNavigate()
  useEffect(() => {
    const url = cohortId ? `/challenges/v/${id}/about/${cohortId}` : `/challenges/v/${id}/about`
    navigate(url)
  }, [])
  return (
    <div className='w-full h-screen md:h-[200px] md:w-[400px] flex items-center justify-center'>
      <Spinner />
    </div>
  )
}
