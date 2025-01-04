import { useNavigate, useParams } from '@remix-run/react'
import { useEffect } from 'react'
import { Spinner } from '@material-tailwind/react'
interface ShareProps {
  slug: string
}
export default function Share (props: ShareProps): JSX.Element {
  const params = useParams()
  const slug = props.slug ?? params.slug
  const id = slug.substring(1)
  const navigate = useNavigate()
  useEffect(() => {
    navigate(`/challenges/v/${id}/about`)
  }, [])
  return (
    <div className='w-full h-screen md:h-[200px] md:w-[400px] flex items-center justify-center'>
      <Spinner />
    </div>
  )
}
