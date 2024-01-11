import { requireCurrentUser } from "../utils/auth.server"
import { LoaderFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react';
import { CurrentUserContext } from '../utils/CurrentUserContext';
import { useContext } from "react";

export const loader: LoaderFunction = async ({ request }) => {
  return await requireCurrentUser(request)
}

export default function PostsNew({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  const {currentUser, setCurrentUser} = useContext(CurrentUserContext)
  setCurrentUser(data)
  return  (
          <>
            <h1>
              New Post
            </h1>
          </>
          )
  }