import {
  SignIn
} from '@clerk/remix'
import { useDeviceContext } from '~/contexts/DeviceContext'
import { type LoaderFunctionArgs, type LoaderFunction } from '@remix-run/node'
import { useLoaderData, useNavigate } from '@remix-run/react'
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
