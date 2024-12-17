import { useState } from 'react'
export default function LandingPage (): JSX.Element {
  const [step, setStep] = useState(1)

  return (
          <div className='w-screen min-h-full items-center flex flex-col  text-[#555555]'>
            {step === 1 &&
            <>
            <img src="/images/landing/people-bottom.png" alt="people-bottom" className='absolute bottom-0  w-full h-auto' />
            <div className='flex flex-col items-center justify-center'>
              <h1 className='text-4xl font-bold'>Welcome to Trybe</h1>
              <p className='text-lg'>We are glad to have you here</p>
            </div>
            </>
            }
            {step === 2 &&
            <>
            <img src="/images/landing/process.png" alt="process" className='absolute bottom-0 left-0 w-full h-auto' />
            <div className='flex flex-col items-center justify-center'>
              <h1 className='text-4xl font-bold'>Welcome to Trybe</h1>
              <p className='text-lg'>We are glad to have you here</p>
            </div>
            </>
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
          </div>
  )
}
