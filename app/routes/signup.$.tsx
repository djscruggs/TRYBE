import { type LoaderFunction, type LoaderFunctionArgs } from 'react-router';
import { SignUp } from '@clerk/remix'
import Logo from '~/components/logo'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useDeviceContext } from '~/contexts/DeviceContext'
import { isMobile } from 'react-device-detect'

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  // const { userId } = await getAuth(args)
  // if (userId) {
  //   return redirect('/challenges')
  // }
  return null
}
export default function SignUpPage (): JSX.Element {
  const [searchParams] = useSearchParams()
  const clerkSignup = Boolean(searchParams.get('clerkSignup'))
  const [showClerkSignup, setShowClerkSignup] = useState(clerkSignup)
  const { isMobile } = useDeviceContext()
  const navigate = useNavigate()

  return (
    <div className="w-sm justify-center items-center mt-10">
      {!isMobile() &&
      <div className='justify-center w-sm'>
        <SignUp
        appearance={{
          variables: {
            colorPrimary: '#FABFC4',
            colorText: '#6b7280'
          },
          elements: {
            formButtonPrimary:
              'bg-red hover:bg-slate-400 text-sm normal-case'
          }
        }}
        />
      </div>
      }
    </div>
  )
}
