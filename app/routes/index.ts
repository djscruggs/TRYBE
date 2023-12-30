// app/routes/index.ts

import { LoaderFunction, redirect } from '@remix-run/node'
import { requireUserId } from '~/src/utils/auth.server'

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request)
  return redirect('/home')
}