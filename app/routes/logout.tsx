import { type LoaderFunction, type LoaderFunctionArgs, type ActionFunction } from 'react-router'
import { logout, getUserSession } from '~/models/auth.server'
import { storage } from '~/models/auth.server'
import { getAuth } from '@clerk/react-router/server'
import { useEffect, JSX, useContext } from 'react'
import { useClerk } from '@clerk/react-router'
import { CurrentUserContext } from '~/contexts/CurrentUserContext'
import { redirect } from 'react-router'

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  const { userId } = await getAuth(args)
  
  // Always destroy custom session and redirect immediately
  // Don't wait for Clerk - just clear everything and go
  return await logout({ ...args, redirectUrl: '/login' })
}

export const action: ActionFunction = async (args: LoaderFunctionArgs) => {
  // This handles destroying the custom session via POST
  try {
    const session = await getUserSession(args.request)
    await storage.destroySession(session)
    return redirect('/login', {
      headers: {
        'Set-Cookie': await storage.destroySession(session)
      }
    })
  } catch (error) {
    // Session might not exist, that's okay - just redirect
    return redirect('/login')
  }
}

export default function LogoutPage(): JSX.Element {
  const { setCurrentUser } = useContext(CurrentUserContext)
  const { signOut } = useClerk()

  useEffect(() => {
    // Clear CurrentUserContext immediately
    setCurrentUser(null)
    
    // Sign out from Clerk (fire and forget)
    signOut().catch(() => {
      // Ignore errors
    })
    
    // Redirect immediately - don't wait for anything
    window.location.href = '/login'
  }, [setCurrentUser, signOut])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Signing out...</p>
    </div>
  )
}
