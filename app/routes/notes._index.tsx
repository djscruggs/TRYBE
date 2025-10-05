import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction } from 'react-router';

export const loader: LoaderFunction = async (args) => {
  return await requireCurrentUser(args)
}

export default function Posts ({ children }: { children: React.ReactNode }) {
  return (
          <>
            <h1>
              I am Notes home
            </h1>
          </>
  )
}
