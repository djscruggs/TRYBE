import type { MetaFunction } from '@remix-run/node'
import { WelcomePage } from '~/components/welcomepage'
import React from 'react'

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
