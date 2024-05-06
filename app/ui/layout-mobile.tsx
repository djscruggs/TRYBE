import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useContext } from 'react'
import { Outlet, useLocation } from '@remix-run/react'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import {
  // BellIcon,
  // MagnifyingGlassIcon,
  // ChatBubbleLeftRightIcon,
  HomeIcon,
  ArchiveBoxIcon,
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
  const { currentUser } = useContext(CurrentUserContext)
  // hack to remove padding on welcome screen mobile
  // hide nav if on index, login or register
  const [showNav, setShowNav] = useState(true)
  const location = useLocation()
  const isWelcome = location.pathname === '/'

  useEffect(() => {
    if (['/', '/register', '/login', '/signup', '/signin'].includes(location.pathname)) {
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
            <div className="max-w-screen flex flex-col min-h-screen max-h-screen min-w-screen p-0" onClick={hideMenu}>
                {showNav &&
                <>
                {/*
                <div className="flex justify-between items-start mb-4 pt-2 pr-0">
                     <MagnifyingGlassIcon className='w-6 mr-4 ml-2' />
                    <BellIcon className='w-6 mr-4' />
                    <Link to="/messages">
                    <ChatBubbleLeftRightIcon className='w-6 mr-4' />
                    </Link>
                </div>
                */}
                </>
                }

                <div className={`flex flex-col items-center justify-start  ${isWelcome ? 'p-0' : ' pb-16 px-2'}`}>
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
                <div className="fixed bottom-0 left-0 right-0 max-w-screen flex items-center w-full justify-between m-0 p-0 px-2 py-1 bg-gray-50 border-2 border-slate-200 z-10">
                    <Link to="/" className='w-8 h-8 flex justify-center items-center'>
                    <HomeIcon className='cursor-pointer w-8 h-8' />
                    </Link>
                    <Link to="/challenges" className='w-8 h-8 flex justify-center items-center'>
                    <TrophyIcon className='cursor-pointer w-8 h-8' />
                    </Link>
                    <div className="flex items-center justify-center relative min-w-8" onClick={(event) => { handlePlusClick(event) }}>
                        {/* Your plus sign */}
                        <PlusCircleIcon className='w-12 h-12 text-white rounded-full bg-red text-color-white cursor-pointer text-6xl -mt-10' />
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
                                <div onClick={(event) => { handleNewOpt('/posts/new', event) }} className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-[#FDC94C] mx-2 cursor-pointer text-sm p-2">
                                <ChatBubbleLeftEllipsisIcon className='-scale-x-100' />
                                    <span className="cursor-pointer text-xs">Post</span>
                                </div>

                                <div onClick={(event) => { handleNewOpt('/challenges/new', event) }} className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-[#FDC94C] mx-2 cursor-pointer text-xxs p-3">
                                    <TrophyIcon />
                                    <span className="cursor-pointer text-xs mt-0">Challenge</span>
                                </div>
                               {/* <div onClick={(event) => { handleNewOpt('/groups/new', event) }} className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-[#FDC94C] mx-2 cursor-pointer text-sm p-1">
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
                                </div> */}
                            </div>
                            </motion.main>
                        )}
                        </AnimatePresence>
                    </div>

                    <Link to={`/members/${currentUser?.id}/content`} className='w-8 h-8 flex justify-center items-center'>
                    <ArchiveBoxIcon className='cursor-pointer w-8 h-8' />
                    </Link>
                    <Link to="/profile" className='w-8 h-8 flex justify-center items-center'>
                    <IdentificationIcon className='cursor-pointer w-8 h-8' />
                    </Link>
                </div>
                }
            </div>
  )
}
export default LayoutMobile
