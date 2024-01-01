import * as React from 'react';
import { useLocation } from '@remix-run/react';
import { useState, useEffect } from 'react';
import NavLinks from './navlinks';
import {AnimatePresence, motion} from 'framer-motion'
import type {User, Profile} from '../utils/types.client'

type LayoutWebProps = {
  children: React.ReactNode;
  user: User | null; 
};
const LayoutWeb: React.FC<LayoutWebProps> = ({ children, user=null }) => {
  console.log('layout web, user is', user)
  const location = useLocation();
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
                    <NavLinks user={user}/>
                </div>
                </div>
              </div>
            </div>
            <div className="flex-grow pt-4">
              <AnimatePresence mode='wait' initial={false}>
                  {animate &&
                  <motion.main
                  key={useLocation().pathname}
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  // exit={{opacity: 0}}
                  transition={{duration: 0.3}}
                  >
                  {children}
                  </motion.main>
                  }
                  {!animate &&
                  <motion.main>
                  {children}
                  </motion.main>
                  }
              </AnimatePresence>
            </div>
          </div>
        );
}
export default LayoutWeb;