import { requireCurrentUser } from "../src/utils/auth.server"
import { LoaderFunction, redirect } from '@remix-run/node'

export const loader: LoaderFunction = async ({ request }) => {
  return await requireCurrentUser(request)
}

export default function PostsNew({ children }: { children: React.ReactNode }) {
  return  (
          <>
            <h1>
              New Post
            </h1>
          </>
          )
  }