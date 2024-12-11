import { type LoaderFunction, type LoaderFunctionArgs, redirect } from '@remix-run/node'
import { getAuth } from '@clerk/remix/ssr.server'
import { SignedIn, SignedOut, SignIn, UserProfile, useClerk } from '@clerk/remix'
import { HiOutlineLogout } from 'react-icons/hi'
export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  const auth = await getAuth(args)
  if (!auth.userId) {
    return redirect('/signin')
  }
  return auth
}

export default function Profile (): JSX.Element {
  return (
    <div className='min-h-screen flex flex-col items-center pt-12 justify-center md:items-start md:justify-start md:flex relative'>
      <SignedIn>
        <div className='flex flex-col items-center justify-center'>
          <UserProfile
            appearance={{
              variables: {
                colorPrimary: '#EC5F5C'
              }
            }}
          />
        </div>
      </SignedIn>

      <SignedOut>
        <SignIn />
      </SignedOut>
    </div>
  )
}
