import * as React from 'react';
import LayoutWeb from './layout-web';
import LayoutMobile from './layout-mobile'
import {isMobile} from 'react-device-detect';

export default function Layout({ children }: { children: React.ReactNode }) {
  console.log(isMobile)
  return (
    <>
       {isMobile && <LayoutMobile children={children} />}
       {!isMobile && <LayoutWeb children={children} />}
    </>
  );
}
