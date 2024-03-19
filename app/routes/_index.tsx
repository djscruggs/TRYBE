import React from 'react'
import { Link } from '@remix-run/react'
import { type LoaderFunction, type LoaderFunctionArgs, redirect, type MetaFunction } from '@remix-run/node'
import { getAuth } from '@clerk/remix/ssr.server'

import { WelcomePage } from '~/components/welcomepage'

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  const { userId } = await getAuth(args)
  if (userId) {
    return redirect('/home')
  }
  return null
}

export const meta: MetaFunction = () => [
  { title: 'Trybe' },
  { name: 'description', content: 'Build new habits. Join challenges. Meet your Trybe.' }
]
export default function Index (): JSX.Element {
  return (
          <>
            <WelcomePage />
          </>
  )
}
