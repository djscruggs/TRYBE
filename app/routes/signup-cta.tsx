import { type LoaderFunction, type LoaderFunctionArgs } from 'react-router';
import Logo from '~/components/logo'
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useDeviceContext } from '~/contexts/DeviceContext'

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  // const { userId } = await getAuth(args)
  // if (userId) {
  //   return redirect('/challenges')
  // }
  return null
}

export default function SignupCta (): JSX.Element {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')

  if (redirectTo) {
    localStorage.setItem('redirectTo', redirectTo)
  }
  const navigate = useNavigate()
  const { isMobile } = useDeviceContext()
  const handleSignup = (): void => {
    if (isMobile()) {
      navigate('/mobile/signup')
    } else {
      navigate('/signup')
    }
  }
  return (
    <div className="max-w-md justify-center items-center mt-10">
    <div className='flex flex-col items-center'>
      <div className='flex mt-6'>
        <Logo size='180px' backgroundColor='white' />
      </div>
      <p className='my-6 text-center text-lg w-3/4  text-lessblack'>In order to join a challenge or create your own, an active Trybe account is required.</p>
      <button className='bg-red text-white text-xl px-4 py-2 w-3/4 md:w-1/2 rounded-full shadow-md' onClick={handleSignup}>Sign up</button>
      <p className='mt-6 mb-4 text-center text-xl w-3/4 md:w-1/2 text-grey'>Already have an account? </p>
      <Link to={isMobile() ? '/mobile/login' : '/login'} className='text-red text-xl underline cursor-pointer'>Log In</Link>

    </div>
    </div>
  )
}
