import { requireCurrentUser } from "../utils/auth.server"
import { LoaderFunction } from '@remix-run/node'
import { useLoaderData, Outlet } from '@remix-run/react';
import { CurrentUserContext } from '../utils/CurrentUserContext';
import { useContext } from "react";

export const loader: LoaderFunction = async ({ request }) => {
  return await requireCurrentUser(request)
}

export default function PostsLayout({ children }: { children: React.ReactNode }) {
  
  return  (
          <>
            <h1>
              I am Posts layout
            </h1>
            <Outlet />
          </>
          )
  }