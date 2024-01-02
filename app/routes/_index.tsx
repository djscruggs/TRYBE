import type { MetaFunction } from '@remix-run/node';


import { LoaderFunction, redirect } from '@remix-run/node'
import { getUser } from '~/src/utils/auth.server'

export const loader: LoaderFunction = async ({ request }) => {
  return (await getUser(request)) ? redirect('/home') : null
}

export const meta: MetaFunction = () => [
  { title: 'Trybe' },
  { name: 'description', content: 'Build new habits. Join challenges. Meet your Trybe.' },
];
export default function Index() {
  return (
    <>
          <h1>I will be the welcome screen for non logged in users</h1>
    </>
  );
}
