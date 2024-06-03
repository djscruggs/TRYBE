// NavLinks.tsx

import { useLocation } from 'react-router-dom'
import {
  HomeIcon,
  TrophyIcon,
  IdentificationIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import { useContext } from 'react'
import { Link } from '@remix-run/react'

const NavLinks = (): JSX.Element => {
  const { currentUser } = useContext(CurrentUserContext)
  const location = useLocation()

  return (
      <>
      {currentUser &&
        <div className="flex flex-col justify-start items-center min-h-full">
          <div className={`w-24 flex items-center flex-col text-darkgrey text-center mb-4 p-2 rounded-lg ${location.pathname === '/' ? 'bg-gray-100' : 'hover:bg-gray-300'}`}>
            <Link to="/home" className='flex items-center flex-col' prefetch='render'>
              <HomeIcon className='className="h-8 w-8 cursor-pointer mb-1' />
              <span className="cursor-pointer ">Home</span>
            </Link>
          </div>
          <div className={`w-24 h-20 flex items-center justify-center flex-col text-darkgrey text-center mb-4 p-2 rounded-lg ${location.pathname === '/challenges' ? 'bg-gray-100' : 'hover:bg-gray-300'}`}>
            <Link to="/challenges" className='flex items-center flex-col' prefetch='render'>
              <TrophyIcon className='h-8 w-8 cursor-pointer mb-1y' />
              <span className="cursor-pointer">Challenges</span>
            </Link>
          </div>
          {/* <div className={`w-24 h-20 flex items-center justify-center flex-col text-darkgrey text-center mb-4 p-2 rounded-lg ${location.pathname === '/community' ? 'bg-gray-100' : 'hover:bg-gray-300'}`}>
            <Link to="/community" className='flex items-center flex-col'>
              <UsersIcon className='h-8 w-8 cursor-pointer mb-1' />
              <span className="cursor-pointer">Community</span>
            </Link>
          </div>
          <div className={`w-24 h-20 flex items-center justify-center flex-col  text-darkgrey text-center mb-4 p-2 rounded-lg ${location.pathname === '/groups' ? 'bg-gray-100' : 'hover:bg-gray-300'}`}>
            <Link to="/groups/" className='flex items-center flex-col'>
              <UserGroupIcon className='h-8 w-8 cursor-pointer mb-1' />
              <span className="cursor-pointer">Groups</span>
            </Link>
          </div>
          <div className={`w-24 h-20 flex items-center justify-center flex-col text-darkgrey text-center mb-4 p-2 rounded-lg ${location.pathname === '/messages' ? 'bg-gray-100' : 'hover:bg-gray-300 hover:animate-pulse'}`}>
            <Link to="/messages" className='flex items-center flex-col'>
              <EnvelopeIcon className='h-8 w-8 cursor-pointer mb-1' />
              <span className="cursor-pointer">Messages</span>
            </Link>
          </div> */}
          <div className={`w-24 h-20 flex items-center justify-center flex-col text-darkgrey text-center mb-4 p-2 rounded-lg ${location.pathname.includes(`/members/${currentUser?.id}/content`) ? 'bg-gray-100' : 'hover:bg-gray-300'}`}>
            <Link to={`/members/${currentUser?.id}/content`} className='flex items-center flex-col'>
              <ArchiveBoxIcon className='h-8 w-8 cursor-pointer mb-1' />
              <span className="cursor-pointer">My Stuff</span>
            </Link>
          </div>
          <div className={`w-24 h-20 flex items-center justify-center flex-col text-darkgrey text-center mb-4 p-2 rounded-lg ${location.pathname === '/profile' ? 'bg-gray-100' : 'hover:bg-gray-300'}`}>
            <Link to="/profile" className='flex items-center flex-col' prefetch='render'>
              <IdentificationIcon className='h-8 w-8 cursor-pointer mb-1' />
              <span className="cursor-pointer">Profile</span>
            </Link>
          </div>
          {/* <div className=" bottom-0  w-24 h-20 flex items-center justify-center flex-col text-darkgrey text-center mb-4 hover:bg-gray-300 p-2 rounded-lg">
            <Form action="/logout"  method="post">
              <Button type="submit" className='flex items-center flex-col bg-inherit shadow-none hover:shadow-none'>
                <PowerIcon className='h-8 w-8 cursor-pointer text-darkgrey' />
                <span className='bg-inherit text-darkgrey font-normal text-base mt-2 normal-case'>Logout</span>
              </Button>
            </Form>
          </div> */}
        </div>
      }
      </>
  )
}

export default NavLinks
