import { useLocation, Outlet } from '@remix-run/react'
import React, { useContext } from 'react'
import NavLinks from './navlinks'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import { UserButton } from '@clerk/clerk-react'
const LayoutWeb = (): JSX.Element => {
  const { currentUser } = useContext(CurrentUserContext)
  const location = useLocation()
  return (
        <div className='w-screen'>
          <div className='bg-yellow sw-screen sticky top-0 h-4 text-xs'></div>
          <div className='flex min-h-screen max-w-2xl'>
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
            { currentUser &&
            <div className={`flex-grow pt-4 ${currentUser ?? location.pathname !== '/' ? 'ml-20' : 'ml-0'}`}>

                <div className='absolute right-0 mr-4'>
                  <UserButton
                    showName={true}
                    afterSignOutUrl="/logout"
                    userProfileUrl="/profile"
                    userProfileMode="navigation"
                  />
                </div>
                <Outlet />
            </div>
            }
            {!currentUser &&
              <div className='flex-grow pt-4 ml-0'>
                <Outlet />
              </div>
            }
          </div>
          <div className='bg-red w-screen sticky bottom-0 max-h-6 text-xs'>
          <div className='flex w-screen lg:w-xl flex-row justify-center items-center pt-1 pb-2'>
              <a href='https://www.notion.so/jointhetrybe/About-TRYBE-ed415205d1a5411f96807cf9e04ee0f6?pvs=4' className='mx-2 text-white underline' >About Us</a>
              <a href='https://www.jointhetrybe.com/trybepartnerships' className='mx-2 text-white underline' >Sponsors & Partnerships</a>
              <a href='https://jointhetrybe.notion.site/Code-of-Conduct-096eb9cbd5ef41f789be899de5004d8e' className='mx-2 text-white underline'>Community Guidelines</a>
              <a href='https://jointhetrybe.notion.site/Privacy-Policy-4b7f09f5efde49adb95fb1845b5b58e9' className='mx-2 text-white underline'>Privacy Policy</a>
            </div>
          </div>
        </div>
  )
}
export default LayoutWeb
