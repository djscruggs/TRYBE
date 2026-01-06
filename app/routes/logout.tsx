import { useEffect, type JSX, useContext } from 'react'
import { useClerk } from '@clerk/react-router'
import { CurrentUserContext } from '~/contexts/CurrentUserContext'
import { useNavigate } from 'react-router'

// No loader - we handle everything client-side to ensure Clerk signs out properly

export default function LogoutPage(): JSX.Element {
  const { setCurrentUser } = useContext(CurrentUserContext)
  const { signOut } = useClerk()
  const navigate = useNavigate()

  useEffect(() => {
    const performLogout = async () => {
      try {
        // 1. Clear CurrentUserContext
        setCurrentUser(null)

        // 2. Sign out from Clerk (clears Clerk session)
        await signOut()

        // 3. Call server to destroy custom session cookie
        await fetch('/api/logout', { method: 'POST' })

        // 4. Navigate to login
        navigate('/login', { replace: true })
      } catch (error) {
        console.error('Logout error:', error)
        // Still navigate to login even if there's an error
        navigate('/login', { replace: true })
      }
    }

    performLogout()
  }, [setCurrentUser, signOut, navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Signing out...</p>
    </div>
  )
}
