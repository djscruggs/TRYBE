import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { Link, useNavigate } from 'react-router-dom';
import {useOutlet, useLocation} from '@remix-run/react';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
import PortraitOutlinedIcon from '@mui/icons-material/PortraitOutlined';
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import {AnimatePresence, motion} from 'framer-motion'

import {theme} from './theme';

export default function LayoutMobile({ children }: { children: React.ReactNode }) {
  
  const [newOpen, setNewOpen] = React.useState(false)
  const outlet = useOutlet()
  const btnColor = theme.palette.primary.main;
  const handlePlusClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation()
    setNewOpen(!newOpen)
  }
  const hideMenu = () => {
    setNewOpen(false)
  }
  const nav = useNavigate()
  const handleNewOpt = (action: string, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    nav(action)
    hideMenu();
  };
  return (
      <Container maxWidth="sm" className='h-screen !p-0 border-2 border-solid border-blue-500'>
        <Box sx={{ my: 0 }} className="h-full p-0">
            <div className="flex flex-col justify-between h-full p-0" onClick={hideMenu}>
                <div className="flex justify-end items-start mb-4 pt-2 pr-0">
                    <SearchIcon fontSize="medium" className='mr-4' />
                    <NotificationsNoneIcon fontSize="medium" className='mr-4' />
                    <ForumOutlinedIcon fontSize="medium" className='mr-4' />
                </div>
                <div className="flex flex-col items-center">
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
                <div className="flex w-full justify-between  m-0 p-0 px-2 py-1 bg-slate-50 border-2 border-slate-200 min-h-12">
                    <Link to="/" >
                    <HomeOutlinedIcon fontSize="large" className='cursor-pointer' />
                    </Link>
                    <Link to="/challenges" >
                    <EmojiEventsOutlinedIcon fontSize="large" className='cursor-pointer' />
                    </Link>
                    <div className="flex items-center justify-center relative" onClick={(event) => handlePlusClick(event)}>
                        {/* Your plus sign */}
                        <AddCircleOutlinedIcon style={{ fontSize: '4rem', color: `${btnColor}` }} className='color-main cursor-pointer text-6xl -mt-10' />
                        <AnimatePresence mode='wait' initial={false}>
                        {newOpen && (
                            <motion.main
                            key={useLocation().pathname}
                            initial={{ opacity: 0}}
                            animate={{ opacity: 1}}
                            exit={{ opacity: 0}}
                            transition={{duration: 0.4}}
                            >
                            <div className="flex absolute top-[-100px] left-1/2 transform -translate-x-1/2">
                               <div onClick={(event) => handleNewOpt('/groups/new', event)} className="flex flex-col items-center justify-center w-20 h-20 rounded-full bg-[#FDC94C] mx-2 cursor-pointer">
                                    <PeopleOutlineOutlinedIcon fontSize='large' />
                                    <span className="cursor-pointer text-xs">Group</span>
                                </div>
                                <div onClick={(event) => handleNewOpt('/posts/new', event)} className="flex flex-col items-center justify-center w-20 h-20  rounded-full bg-[#FDC94C] mx-2  cursor-pointer" style={{ marginTop: '-24px' }}>
                                    <AddCommentOutlinedIcon fontSize="large" className='-scale-x-100' />
                                    <span className="cursor-pointer text-xs">Post</span>
                                </div>
                                <div onClick={(event) => handleNewOpt('/challenges/new', event)} className="flex flex-col items-center justify-center w-20 h-20  rounded-full bg-[#FDC94C] mx-2 cursor-pointer">
                                    <EmojiEventsOutlinedIcon fontSize="large"  />
                                    <span className="cursor-pointer text-xs mt-0">Challenge</span>
                                </div>
                            </div>
                            </motion.main>
                        )}
                        </AnimatePresence>
                    </div>
                    
                    <Link to="/groups" >
                    <PeopleOutlineOutlinedIcon fontSize='large' className='cursor-pointer' />
                    </Link>
                    <Link to="/profile" >
                    <PortraitOutlinedIcon fontSize='large' className='cursor-pointer' />
                    </Link>
                </div>
            </div>
        </Box>
      </Container>
    
  );
}
