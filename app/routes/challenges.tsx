import { useNavigate, useParams, Outlet, useLocation } from '@remix-run/react'
import { useEffect } from 'react'
import type { MetaFunction } from '@remix-run/react'
export const meta: MetaFunction = () => {
  return [
    { title: 'Challenges' }
  ]
}
export default function ChallengesIndex (): JSX.Element {
  const navigate = useNavigate()
  const location = useLocation()
  const { range } = useParams()
  const routeExceptions = ['/new', '/v/', '/mine', '/all']
  const isRouteException = routeExceptions.some(fragment => location.pathname.includes(fragment))
  useEffect(() => {
    if (!range && !isRouteException) {
      navigate('/challenges/active')
    }
  }, [location.pathname])

  return (
    <>
      {isRouteException
        ? <Outlet />
        : (
      <div className='flex items-center w-full mt-2 md:mt-8'>
        <div className="flex flex-col items-center md:max-w-lg w-full">
          <h1 className="text-3xl font-bold mb-4 w-full ml-2 md:ml-0 text-left">
                Challenges
            </h1>
{/* <p className='ml-2 md:ml-0 text-gray-500'>View your current challenges, browse upcoming challenges, or start your own!</p>
            {currentUser && <Button placeholder='Create a Challenge' size="sm" onClick={() => { navigate('./new') }} className="bg-red mb-4 mt-4">Create a Challenge</Button>}
            <Outlet /> */}
            <Outlet />
          </div>
        </div>
          )}
    </>
  )
}
