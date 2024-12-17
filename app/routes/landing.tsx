import { useState, useEffect } from 'react'
import { FaArrowCircleRight } from 'react-icons/fa'
import { useSearchParams } from 'react-router-dom'
import Logo from '../components/logo'
export default function LandingPage (): JSX.Element {
  const [searchParams] = useSearchParams()
  const _step = Number(searchParams.get('step'))
  const [step, setStep] = useState(_step > 0 ? _step : 1)

  return (
          <div className='relative w-screen h-screen items-center flex flex-col border-2 border-red text-[#555555]'>
            <Logo size='36px' backgroundColor='white' className='my-10' />
            {step === 1 &&
            <>
            <div className='relative flex flex-col max-h-[600px] h-full items-start justify-center border border-black text-[#EC5F5C] font-light md:w-2/5 w-full'>
              <div className='text-xl text-left w-full'>Welcome to</div>
              <div className='text-8xl font-bold text-center w-full font-cursive'>Trybe</div>
              <div className='text-xl text-right w-full mb-20'>(BETA)</div>
              <div className='text-[#696262] text-xl text-center w-full'>
                <p className='text-lg'>Discover your next challenge.</p>
                <p className='text-lg'>Find your Trybe.</p>
              </div>
              <FaArrowCircleRight className='z-10 text-red rounded-full text-4xl cursor-pointer absolute bottom-0 right-0 ' onClick={() => { setStep(2) }}/>

            </div>
            <img src="/images/landing/people-bottom.png" alt="people-bottom" className='absolute bottom-0  w-full' />

            </>
            }
            {step === 2 &&
              <div className='relative border-2 border-red'>
                <div className='flex-col h-[600px] items-center justify-center'>
                  <h1 className='text-xl font-bold text-center'>What you can do with <span className='text-[#EC5F5C] font-cursive'>Trybe</span></h1>
                  <p className='text-lg text-center'>Our intentional design lets you<br /> get what you need, no matter <br />what <span className='font-bold'>#mood</span> you&apos;re in</p>
                  <img src="/images/landing/process.png" alt="process" className='max-h-[1000px] mt-14' />
                </div>
              <FaArrowCircleRight className='z-10 text-red rounded-full text-4xl cursor-pointer absolute bottom-0 right-0 ' onClick={() => { setStep(3) }}/>
              </div>
            }
            {step === 3 &&
            <>
            <img src="/images/landing/improvement.png" alt="improvement" className='absolute bottom-0 left-0 w-full h-auto' />
            <div className='flex flex-col items-center justify-center'>
              <h1 className='text-4xl font-bold'>Welcome to Trybe</h1>
              <p className='text-lg'>We are glad to have you here</p>
            </div>
            </>
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
