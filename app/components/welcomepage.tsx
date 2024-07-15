import { useNavigate, useNavigation } from '@remix-run/react'
import {
  Card,
  Button,
  Spinner
} from '@material-tailwind/react'

export const WelcomePage = (): JSX.Element => {
  const navigation = useNavigation()
  return (
          <>
            {/* <div className='w-screen bg-white absolute top-0 h-10 z-10'> kjahsdkjasd</div> */}
          <div className='w-screen min-h-full items-center bg-yellow flex flex-col  text-[#555555]'>
              <div className='flex bg-yellow pb-0 h-screen'>
                <div className='hidden md:block md:w-1/12'></div>
                <div className='flex items-center h-full w-full md:w-5/12'>
                  <div className='flex flex-col px-10 md:px-0 h-full items-center md:items-start'>
                    <div className='justify-start  mt-20 min-w[380px] z-10 md:pl-4'>
                      <h1 className='text-4xl md:text-5xl font-bold '>BUILD NEW HABITS.</h1>
                      <h1 className='text-4xl md:text-5xl font-bold '><span className='bg-yellow z-10 rounded-tr-lg'>JOIN CHALLENGES.</span></h1>
                      <h1 className='text-4xl md:text-5xl font-bold '><span className='bg-yellow z-10 rounded-br-lg'>MEET YOUR TRYBE.</span></h1>

                    </div>
                    <div className='flex w-full max-w[240px] mb-4 mt-10 md:mt-28 justify-center md:pl-8 md:justify-start items-center'>
                      <CardSignup maxWidth='300px'/>
                    </div>
                    <div className='overflow-hidden justify-center items-center md:hidden bg-yellow'>
                        <img src="/images/welcome/hero.webp" alt="Landing Graphic" className='max-w[340px]' />
                      </div>
                  </div>
                </div>
                <div className='hidden md:flex md:flex-col w-5/12 justify-center items-center'>
                  <img src="/images/welcome/hero.webp" alt="Landing Graphic" className='w-full  min-w-[600px] md:min-w-[600px] lg:min-w-[938px] overflow-hidden' />
                </div>
              </div>

              <div className='bg-red min-h-[50px] w-full justify-center fixed bottom-0'>
                <div className='text-white text-md text-center w-full'>
                  <div className='flex w-screen flex-row justify-center items-center pt-1 pb-2 text-xs md:text-sm'>
                    <a href='https://www.notion.so/jointhetrybe/About-TRYBE-ed415205d1a5411f96807cf9e04ee0f6?pvs=4' className='mx-2 text-white underline' >About Us</a>
                    <a href='https://www.jointhetrybe.com/trybepartnerships' className='mx-2 text-white underline' >Sponsors & Partnerships</a>
                    {navigation.state === 'loading'
                      ? <Spinner />
                      : <img src="/logo.png" className='h-[24px] bg-yellow rounded-full' />
                    }
                    <a href='https://jointhetrybe.notion.site/Code-of-Conduct-096eb9cbd5ef41f789be899de5004d8e' className='mx-2 text-white underline'>Community Guidelines</a>
                    <a href='https://jointhetrybe.notion.site/Privacy-Policy-4b7f09f5efde49adb95fb1845b5b58e9' className='mx-2 text-white underline'>Privacy Policy</a>
                  </div>
                </div>
                <div className='text-white text-xs opacity-70 text-center w-full pb-2 md:text-sm'>
                  © 2023 - {new Date().getFullYear()} TRYBE. All Rights Reserved.
                </div>
              </div>
            </div>

          </>

  )
}

function CardSignup ({ maxWidth = '400px' }: { maxWidth?: string }): JSX.Element {
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
        <Card className={`drop-shadow-lg border-gray rounded-lg w-full max-h-[400px] max-w-[${maxWidth}] p-8 pt-4 text-gray-500`}>
          <div className='flex items-center justify-center mb-6'>
            <img src="/logo.png" alt="TRYBE" height="50" width="50"/> <span className='ml-2 text-2xl'>TRYBE</span>
          </div>
          <div className='flex flex-col justify-center h-full'>
            <Button onClick={handleSignUp} className='bg-red rounded-full w-full' aria-label="Sign up button">
              Sign Up
            </Button>
            <div className='mt-8 mb-2'>Already have an account?</div>
            <Button onClick={handleSignIn} className='bg-yellow rounded-full w-full' aria-label="Sign in button">
              Sign In
            </Button>
          </div>
        </Card>
  )
}
