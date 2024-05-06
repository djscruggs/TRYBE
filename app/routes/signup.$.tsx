import { type LoaderFunction, type LoaderFunctionArgs, redirect } from '@remix-run/node'
import { getAuth } from '@clerk/remix/ssr.server'
import { Button } from '@material-tailwind/react'
import { Link } from '@remix-run/react'
import {
  SignUp,
  SignedIn,
  SignedOut
} from '@clerk/clerk-react'

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  // const { userId } = await getAuth(args)
  // if (userId) {
  //   return redirect('/home')
  // }
  return null
}
export default function SignUpPage (): JSX.Element {
  return (
    <div className="h-full w-screen justify-center items-center flex flex-col gap-y-4">
      <SignedIn>
        <div className='absolute top-40 '>
        <h1>You are signed in!</h1>
        <Link to="/home"><Button className="bg-red">Go to Home Page</Button></Link>
        </div>
      </SignedIn>
      <SignedOut>
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
      </SignedOut>
    </div>
  )
}
