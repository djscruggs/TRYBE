import React from 'react'
import { requireCurrentUser } from '../models/auth.server'
import { type LoaderFunction } from '@remix-run/node'

export const loader: LoaderFunction = async (args) => {
  // if thecurrentUser isn't authenticated, this will redirect to login
  return await requireCurrentUser(args)
}

export default function Messages ({ children }: { children: React.ReactNode }) {
  return (
            <>
              <h1>
                I am Messages
              </h1>
            </>
  )
}
