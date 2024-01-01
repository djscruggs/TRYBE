// NavLinks.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Form } from "@remix-run/react";
import { Button } from "@material-tailwind/react";
import { 
        BellIcon,
        HomeIcon,
        TrophyIcon,
        UserGroupIcon,
        UsersIcon,
        IdentificationIcon,
        EnvelopeIcon,
        PowerIcon,
        SunIcon
              } from '@heroicons/react/24/outline'



import type {User, Profile} from '../utils/types.client'
type NavLinksProps = {
  user: User | null
}

const NavLinks: React.FC<NavLinksProps> = ({ user = null }) => {
  
  const pathname = useLocation().pathname;
  const handleSignOut = () => {
    // logout();
    document.location = "/";
  }
  const location = useLocation()

  
  return (
    
    <div className="flex flex-col justify-start items-center min-h-full">
      {user &&
      <>
      <div className={`w-24 flex items-center flex-col text-darkgrey text-center mb-4 p-2 rounded-lg ${location.pathname === '/' ? 'bg-gray-100' : 'hover:bg-gray-300'}`}>
        <Link to="/" className='flex items-center flex-col' >
          <HomeIcon className='className="h-8 w-8 cursor-pointer mb-1' />
          <span className="cursor-pointer ">Home</span>
        </Link>
      </div>
      <div className={`w-24 h-20 flex items-center justify-center flex-col text-darkgrey text-center mb-4 p-2 rounded-lg ${location.pathname === '/challenges' ? 'bg-gray-100' : 'hover:bg-gray-300'}`}>
        <Link to="/challenges" className='flex items-center flex-col'>
          <TrophyIcon className='h-8 w-8 cursor-pointer mb-1y' />
          <span className="cursor-pointer">Challenges</span>
        </Link>
      </div>
      <div className={`w-24 h-20 flex items-center justify-center flex-col text-darkgrey text-center mb-4 p-2 rounded-lg ${location.pathname === '/community' ? 'bg-gray-100' : 'hover:bg-gray-300'}`}>
        <Link to="/community" className='flex items-center flex-col'>
          <UsersIcon className='h-8 w-8 cursor-pointer mb-1' />
          <span className="cursor-pointer">Community</span>
        </Link>
      </div>
      <div className={`w-24 h-20 flex items-center justify-center flex-col  text-darkgrey text-center mb-4 p-2 rounded-lg ${location.pathname === '/groups' ? 'bg-gray-100' : 'hover:bg-gray-300'}`}>
        <Link to="/groups" className='flex items-center flex-col'>
          <UserGroupIcon className='h-8 w-8 cursor-pointer mb-1' />
          <span className="cursor-pointer">Groups</span>
        </Link>
      </div>
      <div className={`w-24 h-20 flex items-center justify-center flex-col text-darkgrey text-center mb-4 p-2 rounded-lg ${location.pathname === '/messages' ? 'bg-gray-100' : 'hover:bg-gray-300'}`}>
        <Link to="/messages" className='flex items-center flex-col'>
          <EnvelopeIcon className='h-8 w-8 cursor-pointer mb-1' />
          <span className="cursor-pointer">Messages</span>
        </Link>
      </div>
      <div className={`w-24 h-20 flex items-center justify-center flex-col text-darkgrey text-center mb-4 p-2 rounded-lg ${location.pathname === '/profile' ? 'bg-gray-100' : 'hover:bg-gray-300'}`}>
        <Link to="/profile" className='flex items-center flex-col'>
          <IdentificationIcon className='h-8 w-8 cursor-pointer mb-1' />
          <span className="cursor-pointer">Profile</span>
        </Link>
      </div>
      </>
      }
      
        
        {user &&
        <div className="absolute bottom-0  w-24 h-20 flex items-center justify-center flex-col text-darkgrey text-center mb-4 hover:bg-gray-300 p-2 rounded-lg">
          <Form action="/signout" method="post">
            <Button type="submit" className='flex items-center flex-col bg-inherit shadow-none hover:shadow-none'>
              <PowerIcon className='h-8 w-8 cursor-pointer text-darkgrey' />
              <span className='bg-inherit text-darkgrey font-normal text-base mt-2 normal-case'>Logout</span>
            </Button>
          </Form>
        </div>
        }
        {!user &&
          <div className="absolute bottom-0 ml-24 w-24 h-20 flex items-center justify-center flex-col text-darkgrey text-center mb-4 hover:bg-gray-300 p-2 rounded-lg">
          <Link to="/login" className='flex items-center flex-col'>
            <SunIcon className='h-8 w-8 cursor-pointer mb-1' />
            <span className="cursor-pointer">Sign In</span>
          </Link>
          </div>
        }
  </div>

  );
};

export default NavLinks;
