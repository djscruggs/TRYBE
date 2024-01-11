
import { requireCurrentUser } from "../src/utils/auth.server"
import { LoaderFunction, redirect } from '@remix-run/node'

export const loader: LoaderFunction = async ({ request }) => {
  // if thecurrentUser isn't authenticated, this will redirect to login
  const currentUser = await requireCurrentUser(request)
  return currentUser
}

export default function Challenges({ children }: { children: React.ReactNode }) {
  return  (
          <>
            <h1>
              I am Challenges
            </h1>
          </>
          )
  }