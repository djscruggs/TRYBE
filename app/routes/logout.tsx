import { type LoaderFunction } from '@remix-run/node'
import { logout } from '~/models/auth.server'

export const loader: LoaderFunction = async (args) => {
  return await logout(args)
}
