import { Spinner } from '@material-tailwind/react'
import { useParams } from '@remix-run/react'
import { useEffect } from 'react'
import useGatedNavigate from '~/hooks/useGatedNavigate'
import { pathFromDotRoute } from '~/utils/helpers'

// this route is used in email links to gate the user to the correct page
// currently is just looks at chats and checkins for challenges
export default function Click (): JSX.Element {
  const params = useParams()
  const navigate = useGatedNavigate()
  useEffect(() => {
    const path = pathFromDotRoute(params.route ?? '')
    const hash = window.location.hash ?? ''
    const newPath = path + hash
    let requireLogin = false
    if (newPath.includes('chat') ?? newPath.includes('checkins')) {
      requireLogin = true
    }

    navigate(newPath, requireLogin)
  }, [])
  return (
    <div className='w-full h-screen md:h-[200px] md:w-[400px] flex items-center justify-center'>
      <Spinner />
    </div>
  )
}
