import {
  type LoaderFunction,
  type LoaderFunctionArgs,
  redirect,
  type MetaFunction,
  type ActionFunction,
  type ActionFunctionArgs,
} from 'react-router';
// import { getAuth } from '@clerk/remix/ssr.server' // TODO: Update for React Router v7
import { useState, useEffect } from 'react'
import { WelcomePage } from '~/components/welcomepage'
import LandingPage from '~/components/landingPage'
import { useNavigate } from 'react-router';

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  const { userId } = await getAuth(args)
  if (userId) {
    return redirect('/challenges')
  }
  return null
}

// TODO: remove this once sentry error is fixed
export const action: ActionFunction = async (args: ActionFunctionArgs) => {
  return null
}

export const meta: MetaFunction = () => [
  { title: 'Trybe' },
  { name: 'description', content: 'Build new habits. Join challenges. Meet your Trybe.' },
  { property: 'og:url', content: 'https://app.jointhetrybe.com' },
  { property: 'og:type', content: 'website' },
  { property: 'og:title', content: 'Trybe' },
  { property: 'og:description', content: 'Build new habits. Join challenges. Meet your Trybe.' },
  { property: 'og:image', content: '/images/trybe-preview.png' },
  { name: 'twitter:card', content: 'summary_large_image' },
  { name: 'twitter:domain', content: 'app.jointhetrybe.com' },
  { name: 'twitter:url', content: 'https://app.jointhetrybe.com' },
  { name: 'twitter:title', content: 'Trybe' },
  { name: 'twitter:description', content: 'Build new habits. Join challenges. Meet your Trybe.' },
  { name: 'twitter:image', content: '/images/trybe-preview.png' }

]
export default function Index (): JSX.Element {
  const splashSeen = localStorage.getItem('splashSeen')
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (splashSeen) {
      navigate('/home')
    } else {
      setLoading(false)
      localStorage.setItem('splashSeen', 'true')
    }
  }, [])
  return (
          <>
            {!loading &&
              <LandingPage />
            }
          </>
  )
}
