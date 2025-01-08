import { requireCurrentUser } from "~/models/auth.server"
import { LoaderFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react';
import { CurrentUserContext } from '~/contexts/CurrentUserContext';
import { useContext } from "react";

export const loader: LoaderFunction = async (args) => {
  return await requireCurrentUser(args)
}
export default function Community({ children }: { children: React.ReactNode }) {
  const {currentUser } = useContext(CurrentUserContext)
  return  (
            <>
              <h1>
                I am Community
              </h1>
            </>
          )
  }