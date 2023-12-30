import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import {theme} from './theme';
import SideNav from './sidenav';
import LayoutWeb from './layout-web';
import LayoutMobile from './layout-mobile'


import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
import PortraitOutlinedIcon from '@mui/icons-material/PortraitOutlined';

export default function Layout({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <>
      <CssBaseline enableColorScheme />
      <ThemeProvider theme={theme}>
       {isMobile && <LayoutMobile children={children} />}
       {!isMobile && <LayoutWeb children={children} />}
      </ThemeProvider>
    </>
  );
}
