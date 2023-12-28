import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import {theme} from './theme';
import NavLinks from './navlinks';




export default function LayoutWeb({ children }: { children: React.ReactNode }) {
  const isAuthenticated = true
  return (
      <Container maxWidth="xl">
        <Box sx={{ m: 0}}>
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
                {children}
                </div>
          </div>
        </Box>
      </Container>
);
}