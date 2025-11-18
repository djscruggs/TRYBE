import { JSX } from 'react'
import Logo from './logo'
import { useNavigate } from 'react-router';
export function WhatsNew (): JSX.Element {
  return (
    <>
      <div className='w-full'>
        <div className='text-lg flex-col justify-start w-full relative bg-white pt-2 rounded-lg'>
          <div className='text-red font-bold pl-0 mb-2'>What&apos;s New</div>
        <div className='flex flex-col items-center justify-between space-x-4 px-0'>
          <WhatsNew1 />

        </div>
      </div>
    </div>

  </>
  )
}

function WhatsNew1 (): JSX.Element {
  const navigate = useNavigate()
  const goto = (): void => {
    navigate('/challenges/v/39')
  }
  return (
    <div className='bg-red rounded-lg p-4 text-sm'>
      <div className='text-lessblack bg-white rounded-lg p-4'>
        <h1 className='text-lg'>Upcoming Group Challenge</h1>
        <div className='flex items-center'>
          <div className='w-5/8'>
            <h1 className='font-bold text-lg'>2026, But Make It Iconic</h1>
            <p>
              This challenge is your space to move forward with purpose,
              clarity, and bold intentions.
              Let&apos;s take the lessons from 2025 and
              create a roadmap for your best year yet.
            </p>

          </div>
          <div className='w-3/8 justify-center flex flex-col items-center'>
            <Logo size='50px'/>
            <button className='cursor-pointer bg-blue rounded-full text-white px-2 py-1 mt-2 text-xs shadow-md shadow-gray-400 w-20' onClick={goto}>Sign Up</button>
          </div>
        </div>
        <p className='font-bold italic mt-2'>Starts Jan 20th | 12 Days | Writing</p>
      </div>
    </div>
  )
}

function WhatsNew2 (): JSX.Element {
  return (
    <div className='h-40 w-60 border border-red rounded-lg bg-white p-4 text-red'>Item 2</div>
  )
}
