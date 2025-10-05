import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction } from 'react-router';
import { useLoaderData } from 'react-router';
import { CurrentUserContext } from '~/contexts/CurrentUserContext'
import { useContext } from 'react'

export const loader: LoaderFunction = async (args) => {
  // if the user isn't authenticated, this will redirect to login
  const currentUser = await requireCurrentUser(args)
  return currentUser
}
export default function GroupsNew ({ children }: { children: React.ReactNode }) {
  return (
            <>
             <h1>
                New Group
              </h1>
            </>
  )
}
