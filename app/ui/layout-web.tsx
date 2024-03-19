import { useLocation, Outlet } from '@remix-run/react'
import React, { useState, useEffect, useContext } from 'react'
import NavLinks from './navlinks'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import { UserButton } from '@clerk/clerk-react'
const LayoutWeb = (): JSX.Element => {
  const { currentUser } = useContext(CurrentUserContext)
  const location = useLocation()
  console.log('location', location)
  return (
          <div className='flex min-h-screen'>
            {currentUser &&

            <div className="hidden md:flex flex-col justify-start items-start mr-8">
              <div className="flex items-center mb-4 mt-10">
                <div className="flex h-full flex-col px-3 py-4 md:px-2">
                  <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2 h-full">
                      <div className='fixed'>
                        <NavLinks />
                      </div>
                  </div>
                </div>
              </div>
            </div>
            }
            <div className={`flex-grow pt-4 ${currentUser ?? location.pathname !== '/' ? 'ml-20' : 'ml-0'}`}>
              { currentUser &&
                <div className='absolute right-0 mr-4'>
                  <UserButton
                    showName={true}
                    afterSignOutUrl="/logout"
                    userProfileUrl="/profile"
                    userProfileMode="navigation"
                    />
                </div>
              }
                 <Outlet />
            </div>
          </div>
  )
}
export default LayoutWeb
