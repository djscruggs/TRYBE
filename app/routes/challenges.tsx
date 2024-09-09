import { useNavigate, useParams, Outlet, useLocation } from '@remix-run/react'
import { useEffect, useContext } from 'react'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { Button } from '@material-tailwind/react'

export default function ChallengesIndex (): JSX.Element {
  const navigate = useNavigate()
  const location = useLocation()
  const { status } = useParams()
  const { currentUser } = useContext(CurrentUserContext)
  const routeExceptions = ['/new', '/v/']
  const isRouteException = routeExceptions.some(fragment => location.pathname.includes(fragment))
  useEffect(() => {
    if (!status && !isRouteException) {
      navigate('/challenges/active')
    }
  }, [location.pathname])
  if (isRouteException) {
    return <Outlet />
  }
  return (
    <div className='flex items-center  max-w-xl mt-14'>
      <div className="flex flex-col items-center max-w-lg w-full">
        <h1 className="text-3xl font-bold mb-4 w-full ml-2 md:ml-0">
              Challenges
        </h1>
        <p className='ml-2 md:ml-0 text-gray-500'>View your current challenges, browse upcoming challenges, or start your own!</p>
          {currentUser && <Button placeholder='Create a Challenge' size="sm" onClick={() => { navigate('./new') }} className="bg-red mb-4 mt-4">Create a Challenge</Button>}
          <Outlet />
      </div>
    </div>
  )
}
