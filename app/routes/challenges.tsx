

import { requireCurrentUser } from "../utils/auth.server"
import { LoaderFunction } from '@remix-run/node'
import { Button } from "@material-tailwind/react";
import { useLoaderData, Link, Outlet, useNavigate } from '@remix-run/react';
import { CurrentUserContext } from '../utils/CurrentUserContext';
import { useContext } from "react";

export const loader: LoaderFunction = async ({ request }) => {
  console.log('layout loader')
  // if thecurrentUser isn't authenticated, this will redirect to login
  const currentUser = await requireCurrentUser(request)
  return currentUser
}

export default function ChallengesLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const data = useLoaderData<typeof loader>();
  const {currentUser, setCurrentUser} = useContext(CurrentUserContext)
  setCurrentUser(data)
  return  (
          <>
            <h1>
              I am Challenges Layout
            </h1>
            <Button placeholder='New Challenge' onClick={()=>navigate('./new')} className="bg-red">New Challenge</Button>
            <div className="mt-10">
              <Outlet />
            </div>
          </>
          )
  }