import { type LoaderFunction } from 'react-router'
import { logout } from '~/models/auth.server'

export const loader: LoaderFunction = async (args) => {
  return await logout(args)
}
