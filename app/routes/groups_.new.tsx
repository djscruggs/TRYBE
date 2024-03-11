
import { requireCurrentUser } from "../models/auth.server"
import { LoaderFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react';
import { CurrentUserContext } from '../utils/CurrentUserContext';
import { useContext } from "react";

export const loader: LoaderFunction = async ({ request }) => {
  // if the user isn't authenticated, this will redirect to login
  const currentUser = await requireCurrentUser(request)
  return currentUser
}
export default function GroupsNew({ children }: { children: React.ReactNode }) {
  
  return  (
            <>
             <h1>
                New Group
              </h1>
            </>
          )
  }