import type { MetaFunction } from '@remix-run/node';
import { Link,  } from 'react-router-dom';
import { SunIcon } from '@heroicons/react/24/outline'



export const meta: MetaFunction = () => [
  { title: 'Trybe' },
  { name: 'description', content: 'Build new habits. Join challenges. Meet your Trybe.' },
];
export default function Index() {
  return (
    <>
          <h1>I will be the welcome screen for non logged incurrentUsers</h1>
          <div className="ml-24 w-24 h-20 flex items-center justify-center flex-col text-darkgrey text-center mb-4 hover:bg-gray-300 p-2 rounded-lg">
          <Link to="/login" className='flex items-center flex-col'>
            <SunIcon className='h-8 w-8 cursor-pointer mb-1' />
            <span className="cursor-pointer">Sign In</span>
          </Link>
          </div>

    </>
  );
}
