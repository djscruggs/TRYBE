import { useState, useEffect } from 'react'
import { FaArrowCircleRight } from 'react-icons/fa'
import { useSearchParams, useNavigate } from 'react-router';
import { FaLessThan } from 'react-icons/fa6'
import Logo from '../components/logo'
import HideFeedbackButton from './hideFeedbackButton'
export default function LandingPage (): JSX.Element {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const _step = Number(searchParams.get('step'))
  const [step, setStep] = useState(_step > 0 ? _step : 1)

  const incrementStep = (): void => {
    setStep(step + 1)
    setSearchParams({ step: (step + 1).toString() })
  }

  const skipStep = (): void => {
    navigate('/challenges')
  }

  return (
          <div className='relative w-screen max-w-[800px] h-screen items-start flex-grow flex flex-col rounded-lg md:shadow-inner md:m-4  pt-4 md:pt-8 text-[#555555]'>
            {/* this hides the sentry feedback button that shows up globally */}
            <HideFeedbackButton />

            <div className='w-full mb-4'>
              <div className='flex justify-center items-center w-1/2'>
                <FaLessThan className={`text-lessblack text-lg text-left w-full ${step > 1 ? 'cursor-pointer' : 'invisible'}`} onClick={() => { if (step > 1) { setStep(step - 1) } }}/>
              </div>

            <div className='flex justify-center items-center w-full'>
                <Logo size='48px' backgroundColor='white' />
            </div>
            </div>
            {step === 1 &&
              <div className='relative flex flex-col h-screen flex-grow items-start justify-start  text-red font-light max-w-[800px] w-full'>
                <div className='text-xl text-left w-full pl-20 md:pl-60 mt-10'>WELCOME TO</div>
                <div className='text-8xl font-bold text-center w-full font-cursive'>Trybe</div>
                <div className='text-xl text-right w-full mb-8 md:mb-20 pr-20 md:pr-60'>(BETA)</div>
                <div className='text-[#696262] text-xl text-center w-full'>
                  <p className='text-lg'>Discover your next challenge.</p>
                  <p className='text-lg'>Find your Trybe.</p>

                </div>
                <div className='flex flex-col justify-between w-full mt-12  md:px-24'>
                    <NavigationDots step={step} />
                    <NavigationArrows step={step} skip={skipStep} nextStep={incrementStep} className='mt-24'/>
                </div>
              </div>
            }
            {step === 2 &&
              <div className='relative w-full flex-grow'>
                <div className='flex-col w-full'>
                  <h1 className='text-xl font-bold text-center mt-0'>What you can do with <span className='text-red font-cursive'>Trybe</span></h1>
                  <div className='text-lg text-center mb-4'>
                    Our intentional design lets you
                    <br />
                    get what you need, no matter
                    <br />
                    what <span className='font-bold'>#mood</span> you&apos;re in
                  </div>
                  <div className='flex justify-center items-center  w-full mb-4'>
                    <img src="/images/landing/howitworks.png" alt="How it works" className='h-[360px]' />
                  </div>
                  <div className='flex flex-col justify-between w-full flex-grow md:mt-16 md:px-24'>
                    <NavigationDots step={step} />
                    <NavigationArrows step={step} skip={skipStep} nextStep={incrementStep} className='mt-16 md:mt-32'/>
                  </div>

                </div>

              </div>
            }
            {step === 3 &&
              <div className='relative w-full'>
                <div className='flex-col h-[600px] w-full items-center justify-center'>
                  <div className='flex flex-col items-center justify-center w-full'>
                    <h1 className='text-4xl font-bold mb-6'>We&apos;re in <span className='text-red font-cursive'>Beta</span></h1>
                    <p className='text-lg mb-4'>There&apos;s a reason our motto is <br />
                    <span className='font-bold'>&ldquo;progress, not perfection&rdquo;</span>
                    </p>
                    <p className='text-lg'>We&apos;re in BETA and we have a long
                    <br />
                    ways to go. We&apos;d love to hear any
                    <br />and all feedback along the way to
                    <br />make it the best place for you and
                    <br /> your Trybe &lt;3
                    </p>
                  </div>
                  <div className='flex justify-center items-start  w-full mb-2'>
                    <img src="/images/landing/improvement.png" alt="Continuous improvement is better than delayed perfection" className='w-auto h-[200px]' />
                  </div>
                  <div className='flex-col justify-center items-center space-x-2 w-full md:mt-16 md:px-24'>
                    <NavigationDots step={step} />
                    <NavigationArrows step={step} skip={skipStep} nextStep={incrementStep} className='mt-12 md:mt-16' />
                  </div>

                </div>

              </div>
            }
            {step === 1 &&
              <img src="/images/landing/people-bottom.png" alt="people-bottom" className='absolute bottom-0 md:bottom-0 w-full object-cover' />
            }
          </div>
  )
}

const NavigationDots = ({ step = 1 }: { step: number }): JSX.Element => {
  useEffect(() => {

  }, [step])
  return (
  <div className='flex justify-center w-full items-center space-x-2'>
    {[1, 2, 3].map((page) => (
      <div
        key={page}
        className={` h-2 rounded-full ${step === page ? 'w-6 rounded-full bg-red' : 'w-2 bg-gray-400'} `}
      />
    ))}
  </div>
  )
}

const NavigationArrows = ({ step = 1, nextStep, skip, className }: { step: number, nextStep: () => void, skip: () => void, className: string }): JSX.Element => {
  const navigate = useNavigate()
  const getStarted = (): void => {
    navigate('/challenges')
  }
  useEffect(() => {

  }, [step])
  return (
    <div className={`w-full relative flex justify-start items-center space-x-2 ${className}`}>
      {step < 3 &&
        <>
        <div className='z-10 text-gray-400 cursor-pointer text-xl absolute bottom-7 left-6' onClick={() => { skip() }}>SKIP</div>
        <FaArrowCircleRight className='z-10 text-red rounded-full text-4xl cursor-pointer absolute bottom-6 right-6' onClick={() => { nextStep() }}/>
        </>
      }
      {step > 2 &&
      <>
      <div className='z-10 text-gray-400 cursor-pointer text-xl absolute bottom-0 left-6' onClick={() => { skip() }}>DONE</div>
      <button onClick={getStarted} className="p-2 py-1 rounded-full bg-red text-white text-sm uppercase absolute bottom-0 right-6">
        Get Started
      </button>
      </>
}

    </div>
  )
}
