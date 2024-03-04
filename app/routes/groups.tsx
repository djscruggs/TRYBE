import { requireCurrentUser } from "../utils/auth.server"
import { LoaderFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react';
import { CurrentUserContext } from '../utils/CurrentUserContext';
import { useContext } from "react";

export const loader: LoaderFunction = async ({ request }) => {
  // if thecurrentUser isn't authenticated, this will redirect to login
  return await requireCurrentUser(request)
}
export default function Groups({ children }: { children: React.ReactNode }) {
  const {currentUser } = useContext(CurrentUserContext)
  return  (
            <>
             <h1>
                I am Groups
              </h1>
            </>
          )
  }