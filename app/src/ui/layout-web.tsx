import { useLocation } from '@remix-run/react';
import { useState, useEffect, useContext } from 'react';
import NavLinks from './navlinks';
import {AnimatePresence, motion} from 'framer-motion'
import UserAvatar from '../components/useravatar'
import { Outlet } from '@remix-run/react';
import { CurrentUserContext } from '../utils/CurrentUserContext'

const LayoutWeb = () => {
  const location = useLocation();
  const {currentUser, setCurrentUser} = useContext(CurrentUserContext)
  const [animate,setAnimate] = useState(true)
  
  //turn off animation on login and register OR if Link to includes animate state
  useEffect(() => {
    // Check if the key exists in location.state
    if (location.state && 'animate' in location.state) {
      // If the key exists, use its value to set animateIt
      setAnimate(location.state.animate);
    } else if(['/register','/login'].includes(location.pathname)){
        setAnimate(false)
    } else {
      // If the key doesn't exist, set animateIt to true
        setAnimate(true);
    }
  }, [location.pathname]);
  
  return (
          <div className='flex px-2 pt-2 min-h-screen'>
            <div className="flex flex-col justify-start items-start mr-8 ">
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
            <div className="flex-grow pt-4 ml-24">
              {currentUser &&
              <div className='float-right mr-4'>
                <UserAvatar className='cursor-pointer'/>
              </div>
              }
                
              <AnimatePresence mode='wait' initial={false}>
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
              </AnimatePresence>
            </div>
          </div>
        );
}
export default LayoutWeb;