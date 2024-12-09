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
  const { signOut } = useClerk()
  return (
    <div className='h-screen items-center pt-12 justify-center md:items-start  md:h-full md:justify-start md:flex'>
      <SignedIn>
        <div className='flex flex-col items-center justify-center'>
        <UserProfile
          appearance={{
            variables: {
              colorPrimary: '#EC5F5C'
            }
          }}
        />
        <div className='flex flex-col md:hidden items-center justify-center '>
          <HiOutlineLogout className='h-8 w-8 cursor-pointer mt-4 text-darkgrey' onClick={signOut}/>
          Sign Out
        </div>
        </div>
        </SignedIn>

      <SignedOut>
        <SignIn />
      </SignedOut>
    </div>
  )
}
