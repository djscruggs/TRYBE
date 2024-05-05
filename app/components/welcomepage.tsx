import { Link, useNavigate } from '@remix-run/react'
import { useMobileSize } from '~/utils/useMobileSize'
import {
  Card,
  CardBody,
  CardFooter,
  Button
} from '@material-tailwind/react'

export const WelcomePage = (): JSX.Element => {
  const isMobile = useMobileSize()
  const navigate = useNavigate()
  const handleSignIn = (event: any): void => {
    event.preventDefault()
    navigate('/signin')
  }
  const handleSignUp = (event: any): void => {
    event.preventDefault()
    navigate('/signup')
  }
  return (
    <>
      {isMobile
        ? (
        <div className="welcome-page -mt-4">
          <div className="overlap">
            <div className="graphic-shape">
              <div className="overlap-group">
                <div className="ellipse" />
                <div className="div" />
                <img className="img" alt="Ellipse" src="https://c.animaapp.com/ZqyGLRPh/img/ellipse-11.svg" />
              </div>
              <div className="overlap-2">
                <div className="ellipse-2" />
                <div className="ellipse-3" />
              </div>
            </div>
            <Link to="signin">
              <div className="already-have-account cursor-pointer">
              <div className="div-wrapper">
                <p className="p">I already have an account</p>
              </div>
            </div>
            </Link>
            <Link to="/signup">
            <img
              className="sign-up-button cursor-pointer"
              alt="Sign up button"

              src="https://c.animaapp.com/ZqyGLRPh/img/sign-up-button@2x.png"
            />
            </Link>
            <div className="making-personal">
              Making personal
              <br />
              development a<br />
              community mission.
            </div>
            <div className="text-wrapper-2">TRYBE</div>
          </div>
        </div>
          )
        : (
          <div className='w-screen h-screen bg-yellow flex flex-col justify-center items-center'>
          <Card className='drop-shadow-lg border-gray rounded-lg h-1/2 w-1/2 max-h-[400px] max-w-[400px] p-8 text-gray-500'>

            <div className='flex flex-col justify-center items-center h-full'>
            <div className='flex items-center'>
              <img src="/logo.png" alt="TRYBE" height="50" width="50"/> <span className='ml-2 text-2xl'>TRYBE</span>
            </div>
            <div className='text-center w-3/4 my-4'>
                Making personal development a community mission.
            </div>

              <Button onClick={handleSignUp} className='bg-red rounded-full w-full' aria-label="Sign up button">
                Sign Up
              </Button>
              <div className='my-8'>Already have an account?</div>
              <Button onClick={handleSignIn} className='bg-yellow rounded-full w-full' aria-label="Sign in button">
                Sign In
              </Button>

            </div>
          </Card>
          </div>
          )}
    </>
  )
}
