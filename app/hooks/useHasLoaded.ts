import React from 'react'

export default function useHasLoaded (): boolean {
  const [hasLoaded, setHasLoaded] = React.useState(false)
  React.useEffect(() => {
    // Add a small delay to ensure hydration is complete
    const timer = setTimeout(() => {
      setHasLoaded(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])
  return hasLoaded
}
