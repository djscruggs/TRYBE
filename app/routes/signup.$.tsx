import { type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { SignUp } from '@clerk/remix'
import Logo from '~/components/logo'
import { useState } from 'react'
import { Link, useSearchParams } from '@remix-run/react'

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  // const { userId } = await getAuth(args)
  // if (userId) {
  //   return redirect('/challenges')
  // }
  return null
}
export default function SignUpPage (): JSX.Element {
  const [searchParams] = useSearchParams()
  const clerkSignup = Boolean(searchParams.get('clerkSignup'))
  const [showClerkSignup, setShowClerkSignup] = useState(clerkSignup)
  return (
    <div className='max-w-lg justify-center items-center mt-10  w-screen h-screen'>
      {!showClerkSignup && <SignupNotice onSignUp={() => { setShowClerkSignup(true) }} />}
      {showClerkSignup &&
      <div className='justify-center w-sm'>
        <SignUp
        appearance={{
          variables: {
            colorPrimary: '#FABFC4',
            colorText: '#6b7280'
          },
          elements: {
            formButtonPrimary:
              'bg-red hover:bg-slate-400 text-sm normal-case'
          }
        }}
        />
      </div>
      }

    </div>
  )
}

function SignupNotice ({ onSignUp }: { onSignUp: () => void }): JSX.Element {
  return (
    <div className='flex flex-col items-center w-lg'>
      <div className='text-xl text-red'>WELCOME TO</div>
      <div className='text-8xl font-bold text-red text-center w-full font-cursive'>Trybe</div>
      <div className='flex mt-6'>
        <Logo size='180px' backgroundColor='white' />
      </div>
      <p className='my-6 text-center text-lg w-3/4  text-lessblack'>In order to join a challenge or create your own, an active Trybe account is required.</p>
      <button className='bg-red text-white text-xl px-4 py-2 w-3/4 md:w-1/2 rounded-full shadow-md' onClick={onSignUp}>Sign up</button>
      <p className='mt-6 mb-4 text-center text-xl w-3/4 md:w-1/2 text-grey'>Already have an account? </p>
      <Link to='/login' className='text-red text-xl underline'>Log In</Link>

    </div>
  )
}
