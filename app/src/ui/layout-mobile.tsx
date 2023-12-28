import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
import PortraitOutlinedIcon from '@mui/icons-material/PortraitOutlined';

import {theme} from './theme';

export default function LayoutMobile({ children }: { children: React.ReactNode }) {
  
  const btnColor = theme.palette.primary.main;
  return (
      <Container maxWidth="sm" className='h-screen'>
      <Box sx={{ my: 0 }} className="h-full">
          <div className="flex flex-col justify-between h-full pb-4 px-4">
              <div className="flex justify-end items-start mb-4 pt-2 pr-0">
                  <SearchIcon fontSize="medium" className='mr-4' />
                  <NotificationsNoneIcon fontSize="medium" className='mr-4' />
                  <ForumOutlinedIcon fontSize="medium" className='mr-1' />
              </div>
              <div className="flex flex-col items-center">
                  {children}
              </div>
              <div className="flex justify-between border border-1 border-red">
                <Link to="/" >
                  <HomeOutlinedIcon fontSize="large" className='cursor-pointer' />
                </Link>
                <Link to="/challenges" >
                  <EmojiEventsOutlinedIcon fontSize="large" className='cursor-pointer' />
                </Link>
                <Link to="/new" className="-mt-6">
                  <AddCircleOutlinedIcon style={{ fontSize: '3rem', color: `${btnColor}` }} className='color-main cursor-pointer text-6xl' />
                </Link>
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