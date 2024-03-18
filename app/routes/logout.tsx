import { type LoaderFunction, redirect, type ActionFunctionArgs } from '@remix-run/node'
import { logout } from '~/models/auth.server'

export async function action ({ request }: ActionFunctionArgs) {
  return await logout(request)
}

export const loader: LoaderFunction = async (args) => {
  return redirect('/')
}
