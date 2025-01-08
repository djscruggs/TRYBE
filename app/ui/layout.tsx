import React, { useContext, useEffect, useState } from 'react'
import { SignedIn, SignedOut, UserButton } from '@clerk/remix'
import useHasLoaded from '~/hooks/useHasLoaded'
import { useLocation, Outlet, useNavigate, Link } from '@remix-run/react'
import { HiOutlineLogin } from 'react-icons/hi'
import NavLinks from './navlinks'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import {
  HomeIcon,
  PlusCircleIcon,
  IdentificationIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'
export default function Layout (): JSX.Element {
  const hasLoaded = useHasLoaded()
  if (!hasLoaded) {
    return <Loading />
  }
  return (
    <>
      <FullLayout />
    </>
  )
}

function Loading (): JSX.Element {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex flex-col justify-center items-center bg-black bg-opacity-40">
      <div className='text-2xl text-white mb-4'>Loading TRYBE...</div>
      <img src="/logo.png" alt="TRYBE" height="100" width="100" className='block'/>
    </div>
  )
}

export const FullLayout = (): JSX.Element => {
  const { currentUser } = useContext(CurrentUserContext)
  const location = useLocation()
  const navigate = useNavigate()
  const [newOpen, setNewOpen] = useState(false)

  // hack to remove padding on welcome screen mobile
  // hide nav if on index, login or register
  const [showNav, setShowNav] = useState(true)
  const [isChat, setIsChat] = useState(location.pathname.includes('/chat'))
  const isWelcome = location.pathname.includes('/challenges/')
  const isLanding = location.pathname.includes('/landing')
  const [showSpacer, setShowSpacer] = useState(true)
  useEffect(() => {
    if (currentUser) {
      const redirectTo = localStorage.getItem('redirectTo') ?? ''
      if (redirectTo) {
        localStorage.removeItem('redirectTo')
        navigate(redirectTo)
        return
      }
    }
    if (['/', '/landing'].includes(location.pathname)) {
      setShowNav(false)
      setShowSpacer(false)
    } else {
      setShowNav(true)
      setShowSpacer(true)
    }
    setIsChat(location.pathname.includes('/chat'))
  }, [location.pathname])

  const handlePlusClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    event.stopPropagation()
    setNewOpen(!newOpen)
  }
  const hideMenu = (): void => {
    setNewOpen(false)
  }
  const handleNewOpt = (action: string, event: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    event.stopPropagation()
    navigate(action)
    hideMenu()
  }
  const [wrapperVisible, setWrapperVisible] = useState(true)
  let scrollTimeout: NodeJS.Timeout
  const handleScroll = (): void => {
    clearTimeout(scrollTimeout)
    setWrapperVisible(false)
    scrollTimeout = setTimeout(() => {
      setWrapperVisible(true)
    }, 300) // Set the footer to reappear after 1 second of no scrolling
  }
  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  return (
      <>
        <div className='hidden md:block w-screen min-h-screen'>
          <div className='flex min-h-screen max-w-screen-2xl'>
            {!isLanding &&
              <div className="hidden md:flex flex-col justify-start items-start mr-8">
                <div className="flex items-center mb-4 mt-10">
                  <div className="flex h-full flex-col px-3 py-4 md:px-2">
                    {showNav &&
                      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2 h-full">
                          <div className='fixed'>
                            <NavLinks />
                          </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }
            <SignedIn>
              <div className={`flex-grow ${(!isLanding && location.pathname !== '/') ? 'pt-4 ml-20' : 'ml-0'}`}>
                {!isLanding &&
                  <div className='absolute right-0 mr-4 z-20'>
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
            </SignedIn>
            <SignedOut>
              <div className={`flex-grow items-center justify-start pt-4 ${showNav ? 'ml-20' : 'ml-0'}`}>
                <div className={`w-lg ${showNav ? 'items-start' : 'items-center'} justify-start h-full`}>
                  <Outlet />
                </div>
              </div>
            </SignedOut>
          </div>

        </div>
        {/* mobile layout */}
        <div className="md:hidden px-1  flex flex-col min-h-screen min-w-screen p-0" onClick={hideMenu}>

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

                <div className={`flex flex-col items-center justify-center  ${isWelcome ? 'p-0' : ' px-2'}`}>

                    <Outlet />
                    {showSpacer &&
                      <div className='min-h-[100px]'>
                        {/* this is a spacer so you can scroll to bottom and menu doesn't cover content */}
                      </div>
                    }
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
                {showNav && !isChat &&
                  <div className={`${wrapperVisible ? 'opacity-100' : 'opacity-30'}  transition-opacity duration-500 fixed bottom-0 left-0 right-0 max-w-screen flex items-center w-full justify-center m-0 p-0 px-2 py-1 bg-gray-50 border-2 border-slate-200 z-10`}>
                    <div className='max-w-lg flex justify-between w-full'>
                      <div className={`flex  items-center  ${currentUser ? 'w-1/3 justify-between' : 'w-1/2 justify-center  '}`}>
                        {currentUser && (
                          <Link to="/home" className='w-8 h-8 flex justify-center items-center'>
                            <HomeIcon className='cursor-pointer w-8 h-8' />
                          </Link>
                        )}
                        <Link to="/challenges" className='w-8 h-8 flex justify-center items-center'>
                          <TrophyIcon className='cursor-pointer w-8 h-8' />
                        </Link>
                      </div>
                      <div className={`flex justify-center items-center ${currentUser ? 'w-1/3' : 'hidden'}`}>
                        {currentUser && (
                          <Link to="/challenges/new" prefetch='render'>
                            <PlusCircleIcon className='w-12 h-12 text-white rounded-full bg-red text-color-white cursor-pointer text-6xl' />
                          </Link>
                        )}
                      </div>
                      <div className={`flex justify-center items-center ${currentUser ? 'w-1/3' : 'w-1/2'}`}>
                        {currentUser
                          ? (
                          <Link to="/profile" className='w-8 h-8 mr-10 flex justify-center items-center'>
                            <IdentificationIcon className='cursor-pointer w-8 h-8' />
                          </Link>
                            )
                          : (
                          <Link to="/signup" className='w-8 h-8 flex justify-center items-center'>
                            <HiOutlineLogin className='cursor-pointer w-8 h-8' />
                          </Link>
                            )}

                      </div>
                  </div>
                  </div>
                }
            </div>
      </>
  )
}
