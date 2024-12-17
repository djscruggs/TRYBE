import { useState, useEffect } from 'react'
import { FaArrowCircleRight } from 'react-icons/fa'
import { useSearchParams } from 'react-router-dom'
import Logo from '../components/logo'
export default function LandingPage (): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams()
  const _step = Number(searchParams.get('step'))
  const [step, setStep] = useState(_step > 0 ? _step : 1)

  const incrementStep = () => {
    setStep(step + 1)
    setSearchParams({ step: (step + 1).toString() })
  }

  const skipStep = () => {
    console.log('skip')
  }

  return (
          <div className='relative w-screen h-screen items-center flex flex-col border-2 border-red text-[#555555]'>
            <Logo size='36px' backgroundColor='white' className='my-10' />
            {step === 1 &&
            <>
            <div className='relative flex flex-col max-h-[600px] h-full items-start justify-center border border-black text-red font-light md:w-2/5 w-full'>
              <div className='text-xl text-left w-full'>Welcome to</div>
              <div className='text-8xl font-bold text-center w-full font-cursive'>Trybe</div>
              <div className='text-xl text-right w-full mb-20'>(BETA)</div>
              <div className='text-[#696262] text-xl text-center w-full'>
                <p className='text-lg'>Discover your next challenge.</p>
                <p className='text-lg'>Find your Trybe.</p>
              </div>
              <NavigationArrows step={step} skip={skipStep} nextStep={incrementStep} />
              <img src="/images/landing/people-bottom.png" alt="people-bottom" className='absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center w-full' />
            </div>

            </>
            }
            {step === 2 &&
              <div className='relative border-2 border-red'>
                <div className='flex-col h-[600px] items-center justify-center'>
                  <h1 className='text-xl font-bold text-center'>What you can do with <span className='text-red font-cursive'>Trybe</span></h1>
                  <p className='text-lg text-center'>Our intentional design lets you<br /> get what you need, no matter <br />what <span className='font-bold'>#mood</span> you&apos;re in</p>
                  <img src="/images/landing/process.png" alt="process" className='max-h-[1000px] mt-14' />
                </div>
                <NavigationArrows step={step} skip={skipStep} nextStep={incrementStep} />
              </div>
            }
            {step === 3 &&
              <div className='relative border-2 border-purple'>
                <div className='flex-col h-[600px] items-center justify-center'>
                  <div className='flex flex-col items-center justify-center'>
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
                  <img src="/images/landing/improvement.png" alt="improvement" className='w-full h-auto' />
                </div>
                <NavigationArrows step={step} skip={skipStep} nextStep={incrementStep} />
              </div>
            }
            <div className='absolute bottom-40 w-full'>
              <NavigationDots step={step} />
            </div>
          </div>
  )
}

const NavigationDots = ({ step = 1 }: { step: number }): JSX.Element => {
  useEffect(() => {
    console.log(step)
  }, [step])
  return (
  <div className='flex justify-center items-center space-x-2'>
    {[1, 2, 3].map((page) => (
      <div
        key={page}
        className={` h-2 rounded-full ${step === page ? 'w-6 rounded-full bg-red' : 'w-2 bg-gray-400'} `}
      />
    ))}
  </div>
  )
}

const NavigationArrows = ({ step = 1, nextStep, skip }: { step: number, nextStep: () => void, skip: () => void }): JSX.Element => {
  console.log(step)
  const getStarted = (): void => {
    console.log('get started')
  }
  useEffect(() => {
    console.log('arrows step', step)
  }, [step])
  return (
    <div className='w-full relative flex justify-center items-center space-x-2'>
      {step < 3 &&
        <>
        <div className='text-gray-400 cursor-pointer absolute bottom-0 left-0' onClick={() => { skip() }}>SKIP</div>
        <FaArrowCircleRight className='z-10 text-red rounded-full text-4xl cursor-pointer absolute bottom-0 right-0' onClick={() => { nextStep() }}/>
        </>
      }
      {step > 2 &&

      <button onClick={getStarted} className="p-2 py-1 rounded-full bg-red text-white text-sm uppercase hover:bg-gray-200 absolute bottom-0 right-0">
        Get Started
      </button>
}

    </div>
  )
}
