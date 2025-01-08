import { Navigate } from '@remix-run/react'
import { useEffect, useContext } from 'react'
import { CurrentUserContext } from '~/contexts/CurrentUserContext'
import type { MetaFunction } from '@remix-run/react'
export const meta: MetaFunction = () => {
  return [
    { title: 'Challenge Templates' },
    {
      property: 'og:title',
      content: 'Challenge Templates'
    }
  ]
}
export default function ChallengeTemplatesIndex (): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const isAdmin = String(currentUser?.role).trim() === 'ADMIN'
  if (!isAdmin) {
    return <Navigate to="/" />
  }

  return (
    <>

      <div className='flex items-center  max-w-xl mt-14'>
        <div className="flex flex-col items-center max-w-lg w-full">
          <h1 className="text-3xl font-bold mb-4 w-full ml-2 md:ml-0">
                Challenge Templates
            </h1>
            {/* <p className='ml-2 md:ml-0 text-gray-500'>View your current challenges, browse upcoming challenges, or start your own!</p>
            {currentUser && <Button placeholder='Create a Challenge' size="sm" onClick={() => { navigate('./new') }} className="bg-red mb-4 mt-4">Create a Challenge</Button>}
            <Outlet /> */}

          </div>
        </div>
    </>
  )
}
