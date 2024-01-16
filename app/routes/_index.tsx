import type { MetaFunction } from '@remix-run/node';
import { Link,  } from 'react-router-dom';
import { SunIcon } from '@heroicons/react/24/outline'
import { WelcomePage } from '~/components/welcomepage';


export const meta: MetaFunction = () => [
  { title: 'Trybe' },
  { name: 'description', content: 'Build new habits. Join challenges. Meet your Trybe.' },
];
export default function Index() {
  return (
    <>
          
          <WelcomePage />
          

    </>
  );
}
