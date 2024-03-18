import { useLocation, Outlet } from '@remix-run/react'
import React, { useState, useEffect, useContext } from 'react'
import NavLinks from './navlinks'
import { AnimatePresence, motion } from 'framer-motion'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import { UserButton } from '@clerk/clerk-react'
const LayoutWeb = () => {
  const location = useLocation()
  const { currentUser } = useContext(CurrentUserContext)
  const [animate, setAnimate] = useState(true)

  // turn off animation on login and register OR if Link to includes animate state
  useEffect(() => {
    // Check if the key exists in location.state
    if (location.state && 'animate' in location.state) {
      // If the key exists, use its value to set animateIt
      setAnimate(location.state.animate)
    } else if (['/register', '/login'].includes(location.pathname)) {
      setAnimate(false)
    } else {
      // If the key doesn't exist, set animateIt to true
      setAnimate(true)
    }
  }, [location.pathname])

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

            <div className={`flex-grow pt-4 ${currentUser ? 'ml-20' : 'ml-0'}`}>
              { currentUser &&
                <div className='absolute right-0 mr-4'>
                  <UserButton afterSignOutUrl="/"/>
                </div>
              }
                 <Outlet />
              {/* <AnimatePresence mode='wait' initial={false}>
                  {animate &&
                  <motion.main
                  key={useLocation().pathname}
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  // exit={{opacity: 0}}
                  transition={{duration: 0.3}}
                  >
                  <Outlet />
                  </motion.main>
                  }
                  {!animate &&
                  <motion.main>
                  <Outlet />
                  </motion.main>
                  }
              </AnimatePresence> */}
            </div>
          </div>
  )
}
export default LayoutWeb
