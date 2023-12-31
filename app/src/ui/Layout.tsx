import * as React from 'react';
import { useEffect, useState } from 'react';
import LayoutWeb from './layout-web';
import LayoutMobile from './layout-mobile'
import {isMobile} from 'react-device-detect';

export default function Layout({ children }: { children: React.ReactNode }) {
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
  return (
    <>
       {useMobile && <LayoutMobile children={children} />}
       {!useMobile && <LayoutWeb children={children} />}
    </>
  );
}
