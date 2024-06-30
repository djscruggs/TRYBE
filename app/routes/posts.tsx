import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction } from '@remix-run/node'
import React, { Outlet } from '@remix-run/react'

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
