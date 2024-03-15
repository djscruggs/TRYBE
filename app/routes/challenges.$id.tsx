import { loadChallengeSummary } from '~/models/challenge.server'
import { Outlet, useLoaderData, Link, useNavigate, useLocation } from '@remix-run/react'
import React, { useContext, useState } from 'react'
import { getUser } from '../models/auth.server'
import type { ObjectData } from '~/utils/types.server'
import type { Challenge } from '~/utils/types.client'
import { json, type LoaderFunction } from '@remix-run/node'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { colorToClassName, convertlineTextToHtml, iconStyle } from '~/utils/helpers'
import { type DateTimeFormatOptions } from 'intl'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import { Spinner } from '@material-tailwind/react'
import { GiShinyApple, GiMeditation } from 'react-icons/gi'
import { FaRegLightbulb } from 'react-icons/fa6'
import { RiMentalHealthLine } from 'react-icons/ri'
import { PiBarbellLight } from 'react-icons/pi'
import { IoFishOutline } from 'react-icons/io5'
import { CiChat1 } from 'react-icons/ci'
import { LiaUserFriendsSolid } from 'react-icons/lia'
import { prisma } from '../models/prisma.server'
import { TbHeartFilled } from 'react-icons/tb'
import { useRevalidator } from 'react-router-dom'

interface ChallengObjectData {
  challenge: Challenge
  isMember: boolean
  hasLiked: boolean
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const currentUser = await getUser(request)
  if (!params.id) {
    return null
  }
  const result = await loadChallengeSummary(params.id, true)
  if (!result) {
    const error = { loadingError: 'Challenge not found' }
    return json(error)
  }
  // load memberships & likes for current user if it exists
  let memberships = 0
  let likes = 0
  if (currentUser) {
    const challengeId = params.id ? parseInt(params.id) : undefined
    memberships = await prisma.memberChallenge.count({
      where: {
        challengeId,
        userId: currentUser.id
      }
    })
    // has the user liked this challenge?
    likes = await prisma.like.count({
      where: {
        challengeId,
        userId: currentUser.id
      }
    })
  }
  const data: ChallengObjectData = { challenge: result, isMember: Boolean(memberships), hasLiked: Boolean(likes) }
  return json(data)
}
export default function ViewChallenge (): JSX.Element {
  const location = useLocation()
  if (location.pathname.includes('edit')) {
    return <Outlet />
  }
  const isComments = location.pathname.includes('comments')
  const { currentUser } = useContext(CurrentUserContext)
  const navigate = useNavigate()
  const revalidator = useRevalidator()
  const [loading, setLoading] = useState<boolean>(false)
  const data: ObjectData = useLoaderData() as ObjectData
  if (!data) {
    return <p>No data.</p>
  }
  if (data?.loadingError) {
    return <h1>{data.loadingError}</h1>
  }
  if (!data?.challenge) {
    return <p>Loading...</p>
  }

  const [isMember, setIsMember] = useState<boolean>(Boolean(data.isMember))

  const handleDelete = async (event: any): Promise<void> => {
    event.preventDefault()
    if (!confirm('Are you sure you want to delete this challenge?')) {
      return
    }
    if (!data.challenge?.id) {
      throw new Error('cannot delete without an id')
    }
    const url = `/api/challenges/delete/${data.challenge.id as string | number}`
    const response = await axios.post(url)
    if (response.status === 204) {
      toast.success('Challenge deleted')
      navigate('/challenges')
    } else {
      toast.error('Delete failed')
    }
  }
  const handleLike = async (event: any): Promise<void> => {
    event.preventDefault()

    const form = new FormData()
    form.append('challengeId', data.challenge.id as string | number)
    if (data.hasLiked) {
      form.append('unlike', true)
    }
    const url = '/api/likes'
    const response = await axios.post(url, form)
    revalidator.revalidate()
  }
  const toggleJoin = async (event: any): Promise<void> => {
    event.preventDefault()
    if (!data.challenge?.id) {
      throw new Error('cannot join without an id')
    }
    setLoading(true)

    const url = `/api/challenges/join-unjoin/${data.challenge.id as string | number}`
    const response = await axios.post(url)
    setIsMember(response.data.result === 'joined')
    setLoading(false)
    // probably should use revalidate instead but this is quicker to add
    // https://github.com/remix-run/react-router/discussions/10381
    revalidator.revalidate()
  }
  const dateOptions: DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }
  const iconOptions: Record<string, JSX.Element> = {
    GiShinyApple: <GiShinyApple className={iconStyle(data.challenge?.color as string)} />,
    GiMeditation: <GiMeditation className={iconStyle(data.challenge?.color as string)} />,
    FaRegLightbulb: <FaRegLightbulb className={iconStyle(data.challenge?.color as string)} />,
    RiMentalHealthLine: <RiMentalHealthLine className={iconStyle(data.challenge?.color as string)} />,
    PiBarbellLight: <PiBarbellLight className={iconStyle(data.challenge?.color as string)} />,
    IoFishOutline: <IoFishOutline className={iconStyle(data.challenge?.color as string)} />
  }
  const color = colorToClassName(data.challenge?.color as string, 'red')
  return (
    <>

    <div className={`max-w-sm border border-transparent border-b-inherit rounded-md bg-gradient-to-b from-${color} to-90%`}>
      <div className={'mb-2 mt-0.5 flex justify-center max-h-80 '}>
          {data.challenge.coverPhoto && <img src={data.challenge.coverPhoto} alt={`${data.challenge.name as string} cover photo`} className="w-full rounded-sm" />}
      </div>
      <div className="mb-6 px-4 flex flex-col justify-center">
      {data.challenge.icon && <div className="mb-2 flex justify-center">{iconOptions[data.challenge.icon as string]}</div>}
        <h1 className='flex justify-center text-2xl'>{data.challenge.name as string}</h1>
        {data.challenge.userId === currentUser?.id && (
          <div className="flex justify-center mt-2">
            <Link className='underline text-red' to = {`/challenges/${data.challenge.id as string | number}/edit`}>edit</Link>&nbsp;&nbsp;
            <Link className='underline text-red' onClick={handleDelete} to = {`/challenges/edit/${data.challenge.id as string | number}`}>delete</Link>&nbsp;&nbsp;
          </div>
        )}
      </div>
      <div className='p-4'>
        <div className="mb-2 text-sm">
          {new Date(data.challenge.startAt).toLocaleDateString(undefined, dateOptions)} to {new Date(data.challenge.endAt).toLocaleDateString(undefined, dateOptions)}
        </div>
        <div className="mb-2">
          <div className='text-center text-sm font-bold'>About</div>
          <div className='text-left mb-4'>
          {convertlineTextToHtml(data.challenge.description)}
          </div>
        </div>
        {data.challenge.mission && (
        <div className="mb-2">
          <div className='text-center text-sm font-bold'>Mission</div>
          <div className='text-left mb-4'>
          {convertlineTextToHtml(data.challenge.mission)}
          </div>
        </div>
        )}
        <div className="mb-2 text-sm">
          Meets <span className="capitalize">{data.challenge.frequency.toLowerCase()}</span>
        </div>

      </div>

    </div>
    {data.challenge.userId === currentUser?.id && (
      <>
        <button
            onClick={toggleJoin}
            className={`mt-8 bg-${color} text-white rounded-md p-2 text-xs`}>
              {isMember ? 'Leave Challenge' : 'Join this Challenge'}
          </button>
          {loading && <Spinner className="h-4 w-4 ml-1 inline" />}
      </>
    )}
    <div className="my-2 text-sm max-w-sm pl-0">
      <div className='flex flex-row justify-left'>
        <div >
          <TbHeartFilled className={`h-5 w-5 cursor-pointer ${data.hasLiked ? 'text-red' : 'text-grey'}`} onClick={handleLike}/>
        </div>

        {data.challenge._count.comments > 0 && !isComments && (
          <div className="underline ml-4">

              <Link to={`/challenges/${data.challenge.id}/comments#comments`}>
                <CiChat1 className="h-5 w-5 -mt-1 text-gray mr-1 inline" />
                {data.challenge._count.comments} comments
              </Link>
          </div>
        )}
        {data.challenge._count?.members > 0 && (
        <div>
          <LiaUserFriendsSolid className="text-gray h-5 w-5 inline ml-4 -mt-1 mr-1" />
          <Link className="underline" to={`/challenges/${data.challenge.id}/members`}>
            {data.challenge._count.members} members
          </Link>
        </div>
        )}
      </div>
    </div>
    {data.challenge._count.comments == 0 && !isComments && (
      <div className="w-full">
        No comments yet. <Link to={`/challenges/${data.challenge.id}/comments`} className="underline">Add comment</Link>
      </div>
    )}
    <div className='mb-16'>
    <Outlet />
    </div>
</>
  )
}
