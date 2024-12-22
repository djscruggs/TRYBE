import {
  SignIn
} from '@clerk/remix'

export default function SignInPage (): JSX.Element {
  const redirectTo = localStorage.getItem('redirectTo') ?? '/quote'
  return (
    <div className="justify-center items-center flex flex-col gap-y-4 w-screen h-screen relative">
      <SignIn
        fallbackRedirectUrl={redirectTo}
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
