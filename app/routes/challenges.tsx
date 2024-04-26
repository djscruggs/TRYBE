import { type LoaderFunction } from '@remix-run/node'
import { Outlet } from '@remix-run/react'
import getUserLocale from 'get-user-locale'

export const loader: LoaderFunction = async (args) => {
  // if thecurrentUser isn't authenticated, this will redirect to login
  return null
}

export default function ChallengesLayout ({ children }: { children: React.ReactNode }): JSX.Element {
  return (
          <>
            <div className="mt-10 w-xl p-2 md:max-w-xl">
              <Outlet />
            </div>
          </>
  )
}
