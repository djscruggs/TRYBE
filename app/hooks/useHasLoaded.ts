import React from 'react'

export default function useHasLoaded (): boolean {
  const [hasLoaded, setHasLoaded] = React.useState(false)
  React.useEffect(() => {
    setHasLoaded(true)
  }, [])
  return hasLoaded
}
