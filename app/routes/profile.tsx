import { type LoaderFunction, type LoaderFunctionArgs, redirect } from '@remix-run/node'
import { getAuth } from '@clerk/remix/ssr.server'
import { SignedIn, SignedOut, SignIn, UserProfile } from '@clerk/remix'
export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  const auth = await getAuth(args)
  if (!auth.userId) {
    return redirect('/signin')
  }
  return auth
}

export default function Profile (): JSX.Element {
  return (
    <div className='h-screen items-center md:items-start justify-start md:h-full md:justify-start md:pt-10 md:flex'>
      <SignedIn>
      <UserProfile
        appearance={{
          variables: {
            colorPrimary: '#FABFC4',
            colorText: '#6b7280'
          },
          formButtonPrimary:
              'bg-slate-500 hover:bg-slate-400 text-sm normal-case'
        }}
        />
      </SignedIn>
      <SignedOut>
        <SignIn />
      </SignedOut>
    </div>
  )
}
