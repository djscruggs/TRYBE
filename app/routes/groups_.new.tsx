
import { requireCurrentUser } from "../src/utils/auth.server"
import { LoaderFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react';
import { CurrentUserContext } from '../src/utils/CurrentUserContext';
import { useContext } from "react";

export const loader: LoaderFunction = async ({ request }) => {
  // if the user isn't authenticated, this will redirect to login
  const currentUser = await requireCurrentUser(request)
  return currentUser
}
export default function GroupsNew({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  const {currentUser, setCurrentUser} = useContext(CurrentUserContext)
  setCurrentUser(data)
  return  (
            <>
             <h1>
                New Group
              </h1>
            </>
          )
  }