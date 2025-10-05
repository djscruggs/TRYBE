import LandingPage from '~/components/landingPage'
import { type MetaFunction } from 'react-router';
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
  return (
          <>
            <LandingPage />
          </>
  )
}
