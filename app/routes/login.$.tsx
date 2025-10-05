import {
  SignIn
} from '@clerk/react-router'
import { useDeviceContext } from '~/contexts/DeviceContext'
import { type LoaderFunctionArgs, type LoaderFunction } from 'react-router';
import { useLoaderData, useNavigate } from 'react-router';
import { useEffect } from 'react'

export const loader: LoaderFunction = async ({ params }: LoaderFunctionArgs) => {
  return { params }
}
export default function SignInPage (): JSX.Element {
  const { params } = useLoaderData<typeof loader>()

  const redirectTo = localStorage.getItem('redirectTo') ?? '/quote'
  const { isMobile } = useDeviceContext()
  const navigate = useNavigate()
  useEffect(() => {
    if (isMobile()) {
      navigate('/mobile/login')
    }
  }, [])

  return (
    <div className="w-sm justify-center items-center mt-10">
      {!isMobile() && (
        <SignIn
          fallbackRedirectUrl={redirectTo}
        appearance={{
          elements: {
            formButtonPrimary:
              'bg-red hover:bg-yellow text-sm normal-case'
          }
        }}
        />
      )}

    </div>
  )
}
