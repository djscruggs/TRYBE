import { requireCurrentUser } from "../src/utils/auth.server"
import { LoaderFunction, redirect } from '@remix-run/node'

export const loader: LoaderFunction = async ({ request }) => {
  // if thecurrentUser isn't authenticated, this will redirect to login
  return await requireCurrentUser(request)
}
export default function Groups({ children }: { children: React.ReactNode }) {
  return  (
            <>
             <h1>
                I am Groups
              </h1>
            </>
          )
  }