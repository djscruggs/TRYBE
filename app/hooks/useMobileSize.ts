import { isMobile } from 'react-device-detect'
import { useState, useEffect } from 'react'
export function useMobileSize(): boolean | null {
  const isBrowser = (): boolean => typeof window !== 'undefined'
  const [windowSize, setWindowSize] = useState({
    width: isBrowser() ? window.innerWidth : null,
    height: isBrowser() ? window.innerHeight : null
  })

  const updateSize = (): void => {
    if (isBrowser()) {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
  }

  useEffect(() => {
    if (isBrowser()) {
      window.addEventListener('resize', updateSize)
      return () => {
        window.removeEventListener('resize', updateSize)
      }
    }
  }, [])

  if (windowSize.width !== null) {
    return windowSize.width < 720
  }
  return isMobile
}
