import * as React from 'react';
import { useEffect, useState } from 'react';
import LayoutWeb from './layout-web';
import LayoutMobile from './layout-mobile'
import {isMobile} from 'react-device-detect';
import { Navigate } from 'react-router-dom';
import { useLocation } from '@remix-run/react';
import { UserContext } from '../utils/usercontext';


export default function Layout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation()
  
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/authCheck');
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          // Handle error cases here if needed
          console.error('Failed to fetch data');
        }
      } catch (error) {
        // Handle fetch errors
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [location.pathname]);
  
  
  
  const isBrowser = () => typeof window !== "undefined"
  const [windowSize, setWindowSize] = useState({
    width: isBrowser() ? window.innerWidth : null,
    height: isBrowser() ? window.innerHeight : null,
  });
  const updateSize = () => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };
  useEffect(() => {
    if(isBrowser()) {
      window.addEventListener('resize', updateSize);
    }
    return () => window.removeEventListener('resize', updateSize);
  }, [])
  
  const useMobile = isMobile || windowSize?.width < 400
  if(!windowSize?.width){
    return (
      <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
        <div className="text-white text-2xl font-bold">Loading...</div>
      </div>
    )
  }
  
  //flag to detect wether they should redirect to hone if not loggd in
  const openRoutes = ['/','login','logout'] //array to track wich routes are allowed for non-logged-in users
  if(!user){
    if(!openRoutes.includes(location.pathname)){
      return <Navigate to={"/"} />
    }
  }

  return (
    <>
    <UserContext.Provider value={user}>
       {useMobile && <LayoutMobile />}
       {!useMobile && <LayoutWeb />}
    </UserContext.Provider>
    </>
  );
}
