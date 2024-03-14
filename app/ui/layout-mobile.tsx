import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Outlet, useLocation } from '@remix-run/react'
import {
  BellIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon,
  UserGroupIcon,
  UsersIcon,
  IdentificationIcon,
  PlusCircleIcon,
  ChatBubbleLeftEllipsisIcon
} from '@heroicons/react/24/outline'
import { AnimatePresence, motion } from 'framer-motion'

const LayoutMobile = (): JSX.Element => {
  const [newOpen, setNewOpen] = useState(false)

  // hide nav if on index, login or register
  const [showNav, setShowNav] = useState(true)
  const location = useLocation()
  useEffect(() => {
    if (['/', '/register', '/login'].includes(location.pathname)) {
      setShowNav(false)
    } else {
      setShowNav(true)
    }
  }, [location.pathname])

  const handlePlusClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    event.stopPropagation()
    setNewOpen(!newOpen)
  }
  const hideMenu = () => {
    setNewOpen(false)
  }
  const navigate = useNavigate()
  const handleNewOpt = (action: string, event: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    event.stopPropagation()
    navigate(action)
    hideMenu()
  }
  return (
            <div className="max-w-screen flex flex-col justify-between h-screen p-0" onClick={hideMenu}>
                {showNav &&
                <div className="flex justify-end items-start mb-4 pt-2 pr-0">
                    <MagnifyingGlassIcon className='w-6 mr-4' />
                    <BellIcon className='w-6 mr-4' />
                    <Link to="/messages">
                    <ChatBubbleLeftRightIcon className='w-6 mr-4' />
                    </Link>
                </div>
                }
                <div className="flex flex-col items-center min-h-fit pb-16 px-2">
                    <Outlet />
                    {/* <AnimatePresence mode='wait' initial={false}>
                        <motion.main
                         key={useLocation().pathname}
                         initial={{opacity: 0}}
                         animate={{opacity: 1}}
                         // exit={{opacity: 0}}
                         transition={{duration: 0.3}}
                        >
                        <Outlet />
                        </motion.main>
                    </AnimatePresence> */}
                </div>
                {showNav &&
                <div className="fixed bottom-0 left-0 right-0 max-w-screen flex w-full justify-between m-0 p-0 px-2 py-1 bg-gray-50 border-2 border-slate-200 z-10">
                    <Link to="/" className='min-w-8'>
                    <HomeIcon className='cursor-pointer' />
                    </Link>
                    <Link to="/challenges" className='min-w-8'>
                    <TrophyIcon className='cursor-pointer' />
                    </Link>
                    <div className="flex items-center justify-center relative min-w-8" onClick={(event) => { handlePlusClick(event) }}>
                        {/* Your plus sign */}
                        <PlusCircleIcon className='min-w-12 text-white rounded-full bg-red text-color-white cursor-pointer text-6xl -mt-10' />
                        <AnimatePresence mode='wait' initial={false}>
                        {newOpen && (
                            <motion.main
                            key={useLocation().pathname}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            >
                            <div className="flex absolute top-[-100px] left-1/2 transform -translate-x-1/2">
                               <div onClick={(event) => { handleNewOpt('/groups/new', event) }} className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-[#FDC94C] mx-2 cursor-pointer text-sm p-1">
                                    <UsersIcon />
                                    <span className="cursor-pointer text-xs">Group</span>
                                </div>
                                <div onClick={(event) => { handleNewOpt('/posts/new', event) }} className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-[#FDC94C] mx-2  cursor-pointer text-sm p-1" style={{ marginTop: '-24px' }}>
                                    <ChatBubbleLeftEllipsisIcon className='-scale-x-100' />
                                    <span className="cursor-pointer text-xs">Post</span>
                                </div>
                                <div onClick={(event) => { handleNewOpt('/challenges/new', event) }} className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-[#FDC94C] mx-2 cursor-pointer text-xxs p-2">
                                    <TrophyIcon />
                                    <span className="cursor-pointer text-xs mt-0">Challenge</span>
                                </div>
                            </div>
                            </motion.main>
                        )}
                        </AnimatePresence>
                    </div>

                    <Link to="/groups" className='min-w-8'>
                    <UserGroupIcon className='cursor-pointer' />
                    </Link>
                    <Link to="/profile" className='min-w-8'>
                    <IdentificationIcon className='cursor-pointer' />
                    </Link>
                </div>
                }
            </div>
  )
}
export default LayoutMobile
