import { type JSX } from 'react'
import { SignIn } from '@clerk/react-router'
import { type LoaderFunctionArgs, type LoaderFunction } from 'react-router'
import { rootAuthLoader } from '@clerk/react-router/server'

export async function loader(
  args: LoaderFunctionArgs
): Promise<LoaderFunction> {
  return (await rootAuthLoader(args)) as LoaderFunction
}

export default function SignInPage(): JSX.Element {
  return (
    <div className="w-full flex flex-col justify-center items-start mt-10">
      <SignIn
        routing="hash"
        fallbackRedirectUrl="/home"
        appearance={{
          elements: {
            formButtonPrimary: 'bg-red hover:bg-yellow text-sm normal-case'
          }
        }}
      />
    </div>
  )
}
