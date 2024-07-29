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
  { name: 'description', content: 'Build new habits. Join challenges. Meet your Trybe.' },
  { name: 'og:image', content: '/images/trybe-preview.png' },
  { name: 'twitter:image', content: '/images/trybe-preview.png' },
  { property: 'og:url', content: 'https://app.jointhetrybe.com' },
  { property: 'og:type', content: 'website' },
  { property: 'og:title', content: 'Trybe' },
  { property: 'og:description', content: 'Build new habits. Join challenges. Meet your Trybe.' },
  { property: 'og:image', content: '' },
  { name: 'twitter:card', content: 'summary_large_image' },
  { name: 'twitter:domain', content: 'app.jointhetrybe.com' },
  { name: 'twitter:url', content: 'https://app.jointhetrybe.com' },
  { name: 'twitter:title', content: 'Trybe' },
  { name: 'twitter:description', content: 'Build new habits. Join challenges. Meet your Trybe.' },
  { name: 'twitter:image', content: '/images/trybe-preview.png' }

]
export default function Index (): JSX.Element {
  return (
          <>
            <WelcomePage />
          </>
  )
}
