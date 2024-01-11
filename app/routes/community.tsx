import { requireCurrentUser } from "../src/utils/auth.server"
import { LoaderFunction } from '@remix-run/node'

export const loader: LoaderFunction = async ({ request }) => {
  return await requireCurrentUser(request)
}
export default function Community({ children }: { children: React.ReactNode }) {
  return  (
            <>
              <h1>
                I am Community
              </h1>
            </>
          )
  }