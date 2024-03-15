import { isMobile } from 'react-device-detect'
import { useState, useEffect } from 'react'
export function useMobileSize () {
  const isBrowser = () => typeof window !== 'undefined'
  const [windowSize, setWindowSize] = useState({
    width: isBrowser() ? window.innerWidth : null,
    height: isBrowser() ? window.innerHeight : null
  })
  const updateSize = () => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    })
  }
  useEffect(() => {
    if (isBrowser()) {
      window.addEventListener('resize', updateSize)
    }
    return () => { window.removeEventListener('resize', updateSize) }
  }, [])

  return isMobile || windowSize?.width < 720
}
