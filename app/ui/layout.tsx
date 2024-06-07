import React, { useContext, useEffect, useState } from 'react'
import { SignedIn, SignedOut, UserButton } from '@clerk/remix'
import useHasLoaded from '../utils/useHasLoaded'
import { useLocation, Outlet, useNavigate, Link, useNavigation, useLoaderData } from '@remix-run/react'

import NavLinks from './navlinks'
import { Spinner } from '@material-tailwind/react'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import {
  // BellIcon,
  // MagnifyingGlassIcon,
  // ChatBubbleLeftRightIcon,
  HomeIcon,
  ArchiveBoxIcon,
  TrophyIcon,
  // UserGroupIcon,
  // UsersIcon,
  IdentificationIcon,
  PlusCircleIcon,
  ChatBubbleLeftEllipsisIcon
} from '@heroicons/react/24/outline'
import { AnimatePresence, motion } from 'framer-motion'
import type { RootLoaderData } from '../root'
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
function ClerkAndLayout (): JSX.Element {
  console.log(data.ENV.CLERK_PUBLISHABLE_KEY)
  const data = useLoaderData() as RootLoaderData
  return (
        <ClerkProvider publishableKey={data.ENV.CLERK_PUBLISHABLE_KEY} signInUrl='/signin'>
          <FullLayout />
        </ClerkProvider>
  )
}

export const FullLayout = (): JSX.Element => {
  const { currentUser } = useContext(CurrentUserContext)
  const location = useLocation()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const [newOpen, setNewOpen] = useState(false)
  // hack to remove padding on welcome screen mobile
  // hide nav if on index, login or register
  const [showNav, setShowNav] = useState(true)
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
        <div className='hidden md:block w-screen'>
          {location.pathname !== '/' &&
            <div className={`z-10 bg-yellow sw-screen sticky top-0 h-4 text-xs transition-opacity duration-500 ${wrapperVisible ? 'opacity-100' : 'opacity-0'}`}></div>
          }
          <div className='flex min-h-screen max-w-screen-2xl'>
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
            <SignedIn>
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
            </SignedIn>
            <SignedOut>
              <div className='flex-grow  items-center justify-center'>
                <div className='flex flex-col items-center justify-center h-full'>

                  <Outlet />
                </div>
              </div>
            </SignedOut>
          </div>
          {location.pathname !== '/' &&
            <div className={`z-10 bg-red w-screen sticky bottom-0 max-h-8 text-xs transition-opacity duration-500 ${wrapperVisible ? 'opacity-100' : 'opacity-0'}`}>
              <div className='flex w-screen flex-row justify-center items-center pt-1 pb-2'>
                <a href='https://www.notion.so/jointhetrybe/About-TRYBE-ed415205d1a5411f96807cf9e04ee0f6?pvs=4' className='mx-2 text-white underline' >About Us</a>
                <a href='https://www.jointhetrybe.com/trybepartnerships' className='mx-2 text-white underline' >Sponsors & Partnerships</a>
                {navigation.state === 'loading'
                  ? <Spinner />
                  : <img src="/logo.png" className='h-[24px] bg-yellow rounded-full' />
                }
                <a href='https://jointhetrybe.notion.site/Code-of-Conduct-096eb9cbd5ef41f789be899de5004d8e' className='mx-2 text-white underline'>Community Guidelines</a>
                <a href='https://jointhetrybe.notion.site/Privacy-Policy-4b7f09f5efde49adb95fb1845b5b58e9' className='mx-2 text-white underline'>Privacy Policy</a>
              </div>
            </div>
          }
        </div>
        {/* mobile layout */}
        <div className="md:hidden max-w-screen flex flex-col min-h-screen max-h-screen min-w-screen p-0" onClick={hideMenu}>
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
                      <Link to="/" className='w-8 h-8 ml-6 flex justify-center items-center'>
                        <HomeIcon className='cursor-pointer w-8 h-8' />
                      </Link>
                      <Link to="/challenges" className='w-8 h-8 flex justify-center items-center' prefetch='render'>
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
                                  <div onClick={(event) => { handleNewOpt('/posts/new', event) }} className="flex flex-col items-center justify-center w-16 h-16 rounded-full border border-black bg-[#FDC94C] mx-2 cursor-pointer text-sm p-2">
                                  <ChatBubbleLeftEllipsisIcon className='-scale-x-100' />
                                      <span className="cursor-pointer text-xs">Post</span>
                                  </div>

                                  <div onClick={(event) => { handleNewOpt('/challenges/new', event) }} className="flex flex-col items-center justify-center w-16 h-16 rounded-full border border-black bg-[#FDC94C] mx-2 cursor-pointer text-xxs p-3">
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
                      <Link to="/profile" className='w-8 h-8 mr-6 flex justify-center items-center'>
                        <IdentificationIcon className='cursor-pointer w-8 h-8' />
                      </Link>
                  </div>
                }
            </div>
      </>
  )
}
