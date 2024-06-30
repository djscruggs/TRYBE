import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction } from '@remix-run/node'

export const loader: LoaderFunction = async (args) => {
  return await requireCurrentUser(args)
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
