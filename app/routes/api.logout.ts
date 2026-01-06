import { type ActionFunction, type ActionFunctionArgs } from 'react-router'
import { logout } from '~/models/auth.server'

// POST /api/logout - Destroys the session cookie
export const action: ActionFunction = async (args: ActionFunctionArgs) => {
  return await logout({ ...args, redirectUrl: '/login' })
}
