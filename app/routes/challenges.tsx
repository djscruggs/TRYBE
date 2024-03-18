import { requireCurrentUser } from '../models/auth.server'
import { type LoaderFunction } from '@remix-run/node'

import { useLoaderData, Outlet, useNavigate } from '@remix-run/react'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import { useContext } from 'react'

export const loader: LoaderFunction = async (args) => {
  // if thecurrentUser isn't authenticated, this will redirect to login
  return null
}

export default function ChallengesLayout ({ children }: { children: React.ReactNode }) {
  return (
          <>
            <div className="mt-10">
              <Outlet />
            </div>
          </>
  )
}
