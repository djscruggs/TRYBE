import { type LoaderFunction } from '@remix-run/node'
import { Outlet } from '@remix-run/react'

export const loader: LoaderFunction = async (args) => {
  // if thecurrentUser isn't authenticated, this will redirect to login
  return null
}

export default function ChallengesLayout ({ children }: { children: React.ReactNode }): JSX.Element {
  return (
          <>
            <div className="mt-10">
              <Outlet />
            </div>
          </>
  )
}
