// NavLinks.tsx

import { useLocation, useNavigation } from 'react-router-dom'
import {
  PlusCircleIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'
import { HiOutlineLogout } from 'react-icons/hi'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { useContext, useState } from 'react'
import { Spinner } from '@material-tailwind/react'
import { Link, useNavigate } from '@remix-run/react'
import { useClerk } from '@clerk/remix'
const NavLinks = (): JSX.Element => {
  const { currentUser } = useContext(CurrentUserContext)
  const location = useLocation()
  const { signOut } = useClerk()
  const [isNewOpen, setIsNewOpen] = useState(false)
  const navigation = useNavigation()
  const navigate = useNavigate()
  const toggleNewOpen = (): void => {
    setIsNewOpen(!isNewOpen)
  }
  return (
      <>
      {currentUser &&
        <div className="flex flex-col justify-start items-center h-screen min-h-full ">
          {/* <div className={`w-24 flex items-center flex-col text-darkgrey text-center mb-4 p-2 rounded-lg ${location.pathname === '/' ? 'bg-gray-100' : 'hover:bg-gray-300'}`}>
            <Link to="/challenges" className='flex items-center flex-col' prefetch='render'>
              <HomeIcon className='className="h-8 w-8 cursor-pointer mb-1' />
              <span className="cursor-pointer ">Home</span>
            </Link>
          </div> */}
          <div className={`w-24 h-20 flex items-center justify-center flex-col text-darkgrey text-center mt-4 mb-4 p-2 rounded-lg ${location.pathname === '/challenges' ? 'bg-gray-100' : 'hover:bg-gray-300'}`}>
            <Link to="/challenges" className='flex items-center flex-col' prefetch='render'>
              <TrophyIcon className='h-8 w-8 cursor-pointer mb-1y' />
              <span className="cursor-pointer">Home</span>
            </Link>
          </div>

          {currentUser?.role === 'ADMIN' && !location.pathname.includes('/challenges/new') &&
          <div className='relative' onMouseEnter={toggleNewOpen} onMouseLeave={toggleNewOpen}>
            <div className={'w-24 h-20 flex items-center justify-center flex-col text-darkgrey text-center mt-4 mb-4 p-2 rounded-lg'}>
              <PlusCircleIcon className='h-8 w-8 cursor-pointer mb-1y text-red' onClick={() => { navigate('/challenges/new') }} />
            </div>
          </div>
          }
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
          </div>
          {<div className={`w-24 h-20 flex items-center justify-center flex-col text-darkgrey text-center mb-4 p-2 rounded-lg ${location.pathname.includes(`/members/${currentUser?.id}/content`) ? 'bg-gray-100' : 'hover:bg-gray-300'}`}>
            <Link to={`/members/${currentUser?.id}/content`} className='flex items-center flex-col'>
              <ArchiveBoxIcon className='h-8 w-8 cursor-pointer mb-1' />
              <span className="cursor-pointer">My Stuff</span>
            </Link>
          </div> *
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
          <div className='absolute bottom-10 left-0 w-24 h-20 text-darkgrey text-center mb-4 rounded-lg hover:bg-gray-300 flex flex-col items-center justify-center'>
            <HiOutlineLogout className='h-8 w-8 cursor-pointer mb-1 text-darkgrey' onClick={() => { void signOut() }}/>
            <div className="cursor-pointer">Logout</div>
          </div>
          {navigation.state === 'loading' && <Spinner />}
        </div>
      }
      </>
  )
}

export default NavLinks
