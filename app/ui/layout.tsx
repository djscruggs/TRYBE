import * as React from 'react';
import { useEffect, useState, useContext } from 'react';
import { CurrentUserContext } from '../utils/CurrentUserContext';
import LayoutWeb from './layout-web'
import LayoutMobile from './layout-mobile'
import {ClientOnly} from 'remix-utils/client-only'
import {useMobileSize} from '../utils/useMobileSize'


export default function Layout({ children }: { children: React.ReactNode }) {
  const isMobileSize = useMobileSize()
  const {currentUser} = useContext(CurrentUserContext)
  return (
    <>
      
      
      <ClientOnly fallback={<Loading />}>
        {()=> isMobileSize ? <LayoutMobile /> : <LayoutWeb />}
      </ClientOnly>
      
      
      
      
    </>
  );
}

function Loading(){
  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
      <div className="text-white text-2xl font-bold">Loading...</div>
    </div>
  )
}
