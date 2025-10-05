import { useContext, useEffect, useState } from 'react'
import { useLoaderData, useNavigate } from 'react-router';
import { CurrentUserContext } from '~/contexts/CurrentUserContext'
import getRandomQuote from '~/utils/quotes'
import { type LoaderFunction, type LoaderFunctionArgs } from 'react-router';
import { prisma } from '~/models/prisma.server'
import { requireCurrentUser } from '~/models/auth.server'
import pkg from '@material-tailwind/react';
const { Spinner } = pkg;
interface LoaderData {
  userChallengeCount: number
  userCount: number
}
export const loader: LoaderFunction = async (args: LoaderFunctionArgs): Promise<LoaderData> => {
  const user = await requireCurrentUser(args)
  const memberships = await prisma.memberChallenge.findMany({
    where: {
      userId: user?.id
    }
  })
  const userChallengeCount = memberships.length
  const userCount = await prisma.user.count()

  return {
    userChallengeCount,
    userCount
  }
}

export default function Quote (): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const { userChallengeCount, userCount } = useLoaderData<LoaderData>()
  const [quote, setQuote] = useState({ quote: '', author: '' })

  const navigate = useNavigate()
  const [navigating, setNavigating] = useState(false)
  const goHome = (): void => {
    setNavigating(true)
    navigate('/challenges')
  }
  useEffect(() => {
    setQuote(getRandomQuote())
  }, [])

  return (
    <div className='flex flex-col items-center justify-center h-screen max-w-xl  md:justify-start md:pt-10'>
      <div className='text-center mb-4'>
        <p className='text-sm text-gray-500'>{userCount} TRYBE Challengers To Date</p>
        <h1 className='text-3xl font-bold'>
          {currentUser?.profile?.fullName ? `Hello, ${currentUser?.profile?.fullName}!` : 'Hello!'}
        </h1>
        <p className='text-lg text-gray-700'>You’ve tackled <span className='font-bold'>{userChallengeCount}</span> Challenges</p>
      </div>
      <div className='flex flex-col items-center justify-center bg-white p-6 rounded-lg md:shadow-md mx-4 w-full md:w-2/3 min-h-96'>
        <div className='text-center md:mt-10 mb-4'>
          <span role='img' aria-label='party popper' className='text-4xl'><img src='/images/icons/Celebrate.png' width='100' height='100' alt='party popper' /></span>
        </div>
        <p className='text-center text-lg italic mb-2'>{quote.quote}</p>
        <p className='text-center text-sm text-gray-500'>{quote.author}</p>
      </div>
      <p className='md:hidden text-center text-sm text-gray-500 mt-4 cursor-pointer' onClick={goHome}>Tap to Skip</p>
      <button className='hidden md:block mt-4 bg-red hover:bg-green-500 text-white font-bold py-2 px-4 rounded' onClick={goHome}>
        Home
      </button>
      {navigating && <span className='mt-4'><Spinner /></span>}
    </div>
  )
}
