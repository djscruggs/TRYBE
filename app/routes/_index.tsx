import * as React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Link as RemixLink } from '@remix-run/react';

import { LoaderFunction } from '@remix-run/node'
import { requireUserId } from '~/src/utils/auth.server'

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request)
  return null
}



// https://remix.run/docs/en/main/route/meta
export const meta: MetaFunction = () => [
  { title: 'Trybe' },
  { name: 'description', content: 'Build new habits. Join challenges. Meet your Trybe.' },
];

// https://remix.run/docs/en/main/file-conventions/routes#basic-routes
export default function Index() {
  return (
    <React.Fragment>
        <h1>Trybe Home Screen</h1>
      
    </React.Fragment>
  );
}
