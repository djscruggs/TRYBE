import { type LoaderFunction, type LoaderFunctionArgs, redirect } from '@remix-run/node'
import { getAuth } from '@clerk/remix/ssr.server'
import { SignedIn, SignedOut, SignIn, UserProfile, useClerk } from '@clerk/remix'
import { HiOutlineLogout } from 'react-icons/hi'
export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  const auth = await getAuth(args)
  if (!auth.userId) {
    return redirect('/login')
  }
  return auth
}

export default function Profile (): JSX.Element {
  const { signOut } = useClerk()
  return (
    <div className='min-h-screen w-screen flex flex-col items-center justify-center pt-4 md:pt-12 md:items-start md:justify-start relative'>
      <SignedIn>
        <div className='flex flex-col items-center justify-center md:items-start w-screen'>
          <div className="cursor-pointer flex flex-col md:hidden items-center justify-center mb-2" onClick={() => { void signOut() }} >
            <HiOutlineLogout className='cursor-pointer w-8 h-8'/>
            Logout
          </div>
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
