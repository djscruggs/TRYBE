import * as React from 'react';
import { useLocation } from 'react-router-dom';
import NavLinks from './navlinks';
import {AnimatePresence, motion} from 'framer-motion'




export default function LayoutWeb({ children }: { children: React.ReactNode }) {
  const isAuthenticated = true
  return (
        
          <div className='flex px-2 pt-2 min-h-screen'>
              <div className="flex flex-col justify-start items-start mr-8">
                  <div className="flex items-center mb-4 mt-10">
                  <div className="flex h-full flex-col px-3 py-4 md:px-2">
                    <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
                      <NavLinks isAuthenticated={isAuthenticated}/>
                    </div>
                  </div>
                  </div>
                  
                </div>
                <div className="flex-grow pt-4">
                  <AnimatePresence mode='wait' initial={false}>
                      <motion.main
                      key={useLocation().pathname}
                      initial={{opacity: 0}}
                      animate={{opacity: 1}}
                      // exit={{opacity: 0}}
                      transition={{duration: 0.3}}
                      >
                      {children}
                      </motion.main>
                  </AnimatePresence>
                </div>
          </div>
        
        );
}
