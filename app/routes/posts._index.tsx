import { requireCurrentUser } from '../models/auth.server'
import { type LoaderFunction } from '@remix-run/node'

export const loader: LoaderFunction = async ({ request }) => {
  return await requireCurrentUser(request)
}

export default function Posts ({ children }: { children: React.ReactNode }) {
  return (
          <>
            <h1>
              I am Posts home
            </h1>
          </>
  )
}
