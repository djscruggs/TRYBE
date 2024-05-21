import { type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { Button } from '@material-tailwind/react'
import { Link } from '@remix-run/react'
import {
  SignIn,
  SignedIn,
  SignedOut
} from '@clerk/remix'
import { getAuth } from '@clerk/remix/ssr.server'

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  const { userId } = await getAuth(args)

  return null
}

export default function SignInPage (): JSX.Element {
  return (
    <div className="justify-center items-center flex flex-col gap-y-4 w-screen h-screen relative">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary:
              'bg-red hover:bg-yellow text-sm normal-case'
          }
        }}
        />
    </div>
  )
}
