import { requireCurrentUser } from "../models/auth.server"
import { LoaderFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react';
import { CurrentUserContext } from '../utils/CurrentUserContext';
import { useContext } from "react";

export const loader: LoaderFunction = async ({ request }) => {
  return await requireCurrentUser(request)
}

export default function PostsNew({ children }: { children: React.ReactNode }) {
  const {currentUser } = useContext(CurrentUserContext)
  return  (
          <>
            <h1>
              New Post
            </h1>
          </>
          )
  }