import {
  SignIn
} from '@clerk/remix'

export default function SignInPage (): JSX.Element {
  const redirectTo = localStorage.getItem('redirectTo') ?? '/quote'
  return (
    <div className="w-sm justify-center items-center mt-10">
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
