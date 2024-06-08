import { type LoaderFunction, type LoaderFunctionArgs, redirect } from '@remix-run/node'
import { getAuth } from '@clerk/remix/ssr.server'
import { Button } from '@material-tailwind/react'
import { Link } from '@remix-run/react'
import {
  SignUp,
  SignedIn,
  SignedOut
} from '@clerk/remix'

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  // const { userId } = await getAuth(args)
  // if (userId) {
  //   return redirect('/home')
  // }
  return null
}
export default function SignUpPage (): JSX.Element {
  return (
    <div className="justify-center items-center flex flex-col gap-y-4 w-screen h-screen relative">
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
  )
}
