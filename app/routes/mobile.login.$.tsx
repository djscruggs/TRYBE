import {
  SignIn
} from '@clerk/remix'
import { useDeviceContext } from '~/contexts/DeviceContext'
import { type LoaderFunctionArgs, type LoaderFunction } from '@remix-run/node'
import { Link, useNavigate } from '@remix-run/react'
import { useEffect } from 'react'

export const loader: LoaderFunction = async ({ params }: LoaderFunctionArgs) => {
  return { params }
}
export default function SignInPage (): JSX.Element {
  const redirectTo = localStorage.getItem('redirectTo') ?? '/quote'
  const { isMobile } = useDeviceContext()
  const navigate = useNavigate()
  useEffect(() => {
    if (!isMobile()) {
      navigate('/login')
    }
  }, [])

  return (
    <div className="w-sm justify-center items-center mt-10">
      {isMobile() && (
          <>
          <div className="relative">
            signing in without clerk
          </div>
          <div className="relative">
          Don&apos;t have an account? <Link className="underline text-blue cursor-pointer" to="/mobile/signup">Sign Up</Link>
        </div>
        </>
      )}

    </div>
  )
}
