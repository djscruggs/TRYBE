import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction } from 'react-router';
import React, { Outlet, JSX } from 'react-router';

export const loader: LoaderFunction = async (args) => {
  return await requireCurrentUser(args)
}

export default function PostsLayout ({ children }: { children: React.ReactNode }): JSX.Element {
  return (
          <>
            <Outlet />
          </>
  )
}
