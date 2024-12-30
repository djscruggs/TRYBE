import { useContext } from 'react'
import { CurrentUserContext } from '~/utils/CurrentUserContext'

export function WhatsNew (): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  return (
    <>
    {currentUser?.role === 'ADMIN' &&
      <div className='w-full'>
        <div className='text-lg flex-col justify-start w-full relative bg-red p-4  rounded-md'>
          <div className='text-white font-bold'>What&apos;s New</div>
        <div className='flex items-center justify-between space-x-4'>
          <div className='h-40 w-60 border border-red rounded-md bg-white p-4 text-red'>Item 1</div>
          <div className='h-40 w-60 border border-red rounded-md bg-white p-4 text-red'>Item 2</div>
        </div>
      </div>
    </div>
    }
  </>
  )
}
