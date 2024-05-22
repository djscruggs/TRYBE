import { type LoaderFunction } from '@remix-run/node'
import { Outlet } from '@remix-run/react'

export const loader: LoaderFunction = async (args) => {
  // if thecurrentUser isn't authenticated, this will redirect to login
  return null
}

export default function ChallengesLayout ({ children }: { children: React.ReactNode }): JSX.Element {
  return (
          <>
            <div className="mt-10 max-w-lg md:max-w-3xl p-2 w-screen flex items-center">
              <Outlet />
            </div>
          </>
  )
}
