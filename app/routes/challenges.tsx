

import { requireCurrentUser } from "../models/auth.server"
import { LoaderFunction } from '@remix-run/node'

import { useLoaderData, Outlet, useNavigate } from '@remix-run/react';
import { CurrentUserContext } from '../utils/CurrentUserContext';
import { useContext } from "react";

export const loader: LoaderFunction = async ({ request }) => {
  // if thecurrentUser isn't authenticated, this will redirect to login
  return await requireCurrentUser(request)
  
}

export default function ChallengesLayout({ children }: { children: React.ReactNode }) {
  
  return  (
          <>
            <div className="mt-10">
              <Outlet />
            </div>
          </>
          )
  }