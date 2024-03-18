import { requireCurrentUser } from '../models/auth.server'
import { type LoaderFunction } from '@remix-run/node'
import React, { useLoaderData, Outlet } from '@remix-run/react'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import { useContext } from 'react'

export const loader: LoaderFunction = async (args) => {
  return await requireCurrentUser(args)
}

export default function PostsLayout ({ children }: { children: React.ReactNode }): JSX.Element {
  return (
          <>
            <h1>
              I am Posts layout
            </h1>
            <Outlet />
          </>
  )
}
