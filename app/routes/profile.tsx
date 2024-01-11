import { requireCurrentUser } from "../src/utils/auth.server"
import { LoaderFunction, redirect } from '@remix-run/node'

export const loader: LoaderFunction = async ({ request }) => {
  // if thecurrentUser isn't authenticated, this will redirect to login
  constcurrentUser = await getUser(request)
  if(!user)
    throw redirect('/login')
  return null
}

export default function Profile({ children }: { children: React.ReactNode }) {
  return  (
            <>
              <h1>
                I am Profile
              </h1>
            </>
          )
  }