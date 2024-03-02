

import { requireCurrentUser } from "../utils/auth.server"
import { LoaderFunction } from '@remix-run/node'

import { useLoaderData, Outlet, useNavigate } from '@remix-run/react';
import { CurrentUserContext } from '../utils/CurrentUserContext';
import { useContext } from "react";

export const loader: LoaderFunction = async ({ request }) => {
  // if thecurrentUser isn't authenticated, this will redirect to login
  const currentUser = await requireCurrentUser(request)
  return currentUser
}

export default function ChallengesLayout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  const {currentUser, setCurrentUser} = useContext(CurrentUserContext)
  !currentUser && setCurrentUser(data)
  return  (
          <>
            <div className="mt-10">
              <Outlet />
            </div>
          </>
          )
  }