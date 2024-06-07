import { Link, useNavigate } from '@remix-run/react'
import {
  Card,
  Button
} from '@material-tailwind/react'

export const WelcomePage = (): JSX.Element => {
  return (
          <>
            {/* <div className='w-screen bg-white absolute top-0 h-10 z-10'> kjahsdkjasd</div> */}
            <div className='w-screen min-h-full items-center bg-white flex flex-col  text-[#555555]'>
              <div className='flex  border  bg-yellow pb-4'>
                <div className='hidden md:block md:w-1/12'></div>
                <div className='flex items-center h-full w-full md:w-5/12'>
                  <div className='flex flex-col px-10 md:px-0 h-full items-center md:items-start'>
                    <div className='justify-start  mt-20 min-w[380px]'>
                      <h1 className='text-5xl font-bold'>BUILD NEW HABITS.</h1>
                      <h1 className='text-5xl font-bold'>JOIN CHALLENGES.</h1>
                      <h1 className='text-5xl font-bold'>MEET YOUR TRYBE.</h1>
                      <div className='flex flex-col justify-center items-center w-7/8 md:w-2/3 text-xl  italic mt-10 mb-10'>
                        Join 200+ people getting weekly insights, perspectives and useful tools that accelerate their growth.
                      </div>
                    </div>
                    <CardSignup />
                  </div>
                </div>
                <div className='hidden md:flex md:flex-col w-5/12 justify-center items-center'>
                  <img src="/images/welcome/hero.webp" alt="Landing Graphic" className='w-full  md:min-w-[400px] lg:min-w-[607px]' />
                </div>
              </div>
              <div className='hidden md:block md:w-1/12'></div>
              <div className='w-full block md:flex justify-start pt-10'>
                <div className="hidden md:block md:w-1/12"></div>
                <div className='w-full px-10  md:pl-0 md:w-1/3 md:text-end pr-4 mb-4'>
                  <h1 className='text-5xl font-bold'>TRYBE</h1>

                  <div className='text-2xl italic'>/try-b/</div>
                  <div className='text-lg italic leading-5'>
                    A group of humans <span className='font-bold'>trying</span> to reach new personal heights with a likeminded <span className='font-bold'>tribe</span> of people
                  </div>

                </div>
                <div className='w-full md:w-2/3 text-start px-10 md:pl-4 md:pr-0'>
                  <p className='mb-2'>A personal development community that sets goals, takes on challenges, and authentically shares our journey of growth with other like-minded people.</p>

                  <p className='font-bold'>We make personal growth a community mission</p>

                  <div className='flex flex-row align-top my-4'>
                    <p className='text-yellow text-xl'>Here&apos;s what the TRYBE magic boils down to</p>
                    <img src="/images/welcome/arrow.png" alt="arrow" className='rotate-[20deg] pt-1'/>
                  </div>
                </div>
              </div>
              <div className='w-full block md:flex justify-start'>
                <div className="hidden md:block md:w-1/12"></div>
                <div className='w-full block md:flex md:flex-row'>
                  <div className='w-full md:w-1/3 flex-cols justify-center items-center'>
                    <div className='flex justify-center items-center h-[224px]'>
                      <img src="/images/welcome/challenges.webp" alt="challenges" className=' max-h-[224px]'/>
                    </div>
                    <div className='p-2 text-center'>
                        <div className='text-2xl mt-2 font-bold'>Challenges</div>
                        <div>We celebrate the power of challenges to help focus, structure and kickstart our growth. When you don&apos;t have to do the heavy lifting of planning, scheduling and tracking, you can focus on just showing up, and that&apos;s where the magic and self-discovery unfolds!</div>
                    </div>
                  </div>
                  <div className='w-full md:w-1/3 flex-cols justify-center items-center'>
                    <div className='flex justify-center items-center h-[224px]'>
                      <img src="/images/welcome/community.png" alt="community" className=' max-h-[224px]'/>
                    </div>
                    <div className='p-2 text-center'>
                        <div className='text-2xl mt-2 font-bold'>Community</div>
                        <div>Connect with other like-minded people who understand you, your desire for growth, your struggles, and your triumphs. Surround yourself with others who&apos;ve been there, are there right now, or aspire to be. Feel the growth that comes with finding your TRYBE</div>
                    </div>
                  </div>
                  <div className='w-full md:w-1/3 flex-cols justify-center items-center'>
                    <div className='flex justify-center items-center h-[224px]'>
                      <img src="/images/welcome/coaching.webp" alt="coaching" className=' max-h-[224px]'/>
                    </div>
                    <div className='p-2 text-center'>
                        <div className='text-2xl mt-2 font-bold'>Coaching</div>
                        <div>Sometimes we need a cheerleader, sometimes we need a coach - at TRYBE you get both. With access to others who&apos;ve walked your path before, peer coaching opportunities and systems designed for progress, you can feel both celebrated and guided.</div>
                    </div>
                  </div>
                </div>
                <div className='bg-yellow flex flex-col p-10 px-2 h-full md:hidden'>
                  <CardSignup />
                </div>
              </div>

            </div>

          </>

  )
}

function CardSignup (): JSX.Element {
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
        <Card className='drop-shadow-lg border-gray rounded-lg w-full max-h-[400px] max-w-[400px] p-8 pt-4 text-gray-500'>
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
