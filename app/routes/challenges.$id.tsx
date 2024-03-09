import { loadChallengeSummary } from '~/utils/challenge.server'
import { useLoaderData, Link, useNavigate } from '@remix-run/react'
import React, { useContext, useState } from 'react'
import { requireCurrentUser, getUser } from '../utils/auth.server'
import type { ObjectData } from '~/utils/types.server'
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

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCurrentUser(request)
  if (!params.id) {
    return null
  }
  const result = await loadChallengeSummary(params.id)

  if (!result) {
    const error = { loadingError: 'Challenge not found' }
    return json(error)
  }
  // load memberships for current user
  const u = await getUser(request, true)
  const challengeId = params.id ? parseInt(params.id) : undefined
  let isMember = false
  if (u && u.memberChallenges.filter((c) => c.challengeId === challengeId).length > 0) {
    isMember = true
  }

  const data: ObjectData = { object: result, isMember }
  return json(data)
}
export default function ViewChallenge (): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const navigate = useNavigate()
  const [loading, setLoading] = useState<boolean>(false)
  const data: ObjectData = useLoaderData() as ObjectData
  console.log(data)
  if (!data) {
    return <p>No data.</p>
  }
  if (data?.loadingError) {
    return <h1>{data.loadingError}</h1>
  }
  if (!data?.object) {
    return <p>Loading...</p>
  }

  const [isMember, setIsMember] = useState<boolean>(Boolean(data.isMember))

  const handleDelete = async (event: any): Promise<void> => {
    event.preventDefault()
    if (!confirm('Are you sure you want to delete this challenge?')) {
      return
    }
    if (!data.object?.id) {
      throw new Error('cannot delete without an id')
    }
    console.log('delete', data.object)
    const url = `/api/challenges/delete/${data.object.id as string | number}`
    const response = await axios.post(url)
    if (response.status === 204) {
      toast.success('Challenge deleted')
      navigate('/challenges')
    } else {
      toast.error('Delete failed')
    }
  }
  const toggleJoin = async (event: any): Promise<void> => {
    event.preventDefault()
    if (!data.object?.id) {
      throw new Error('cannot join without an id')
    }
    setLoading(true)

    const url = `/api/challenges/join-unjoin/${data.object.id as string | number}`
    const response = await axios.post(url)
    setIsMember(response.data.result === 'joined')
    setLoading(false)
    // probably should use revalidate instead but this is quicker to add
    // https://github.com/remix-run/react-router/discussions/10381
    navigate('.', { replace: true })
  }
  const dateOptions: DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }
  const iconOptions: Record<string, JSX.Element> = {
    GiShinyApple: <GiShinyApple className={iconStyle(data.object?.color as string)} />,
    GiMeditation: <GiMeditation className={iconStyle(data.object?.color as string)} />,
    FaRegLightbulb: <FaRegLightbulb className={iconStyle(data.object?.color as string)} />,
    RiMentalHealthLine: <RiMentalHealthLine className={iconStyle(data.object?.color as string)} />,
    PiBarbellLight: <PiBarbellLight className={iconStyle(data.object?.color as string)} />,
    IoFishOutline: <IoFishOutline className={iconStyle(data.object?.color as string)} />
  }
  return (
    <>

    <div className={`max-w-sm border-4 border-${colorToClassName(data.object?.color as string, 'red')} rounded-md`}>
      <div className={`mb-2 flex justify-center max-h-80 ${colorToClassName(data.object.color as string, 'red')}`}>
          {data.object.coverPhoto && <img src={data.object.coverPhoto} alt={`${data.object.name as string} cover photo`} className="w-full rounded-sm" />}
      </div>
      <div className="mb-6 flex flex-col justify-center">
      {data.object.icon && <div className="mb-2 flex justify-center">{iconOptions[data.object.icon as string]}</div>}
        <h1 className='flex justify-center text-2xl'>{data.object.name as string}</h1>
        {data.object.userId === currentUser?.id && (
          <div className="flex justify-center mt-2">
            <Link className='underline text-red' to = {`/challenges/edit/${data.object.id as string | number}`}>edit</Link>&nbsp;&nbsp;
            <Link className='underline text-red' onClick={handleDelete} to = {`/challenges/edit/${data.object.id as string | number}`}>delete</Link>&nbsp;&nbsp;
          </div>
        )}
      </div>
      <div className='p-4'>
        <div className="mb-2 text-sm">
          {new Date(data.object.startAt).toLocaleDateString(undefined, dateOptions)} to {new Date(data.object.endAt).toLocaleDateString(undefined, dateOptions)}
        </div>
        <div className="mb-2">
          <div className='text-center text-sm font-bold'>About</div>
          <div className='text-left mb-4'>
          {convertlineTextToHtml(data.object.description)}
          </div>
        </div>
        <div className="mb-2">
          <div className='text-center text-sm font-bold'>Mission</div>
          <div className='text-left mb-4'>
          {convertlineTextToHtml(data.object.mission)}
          </div>
        </div>

        <div className="mb-2 text-sm">
          Meets <span className="capitalize">{data.object.frequency.toLowerCase()}</span>
        </div>
        <div className="mb-2 text-sm">
          <span className="capitalize">{data.object._count.members}</span> members
        </div>

      </div>

    </div>
    {data.object.userId != currentUser?.id && (
      <>
        <button
            onClick={toggleJoin}
            className={`mt-8 bg-${colorToClassName(data.object.color, 'red')} text-white rounded-md p-2`}>
              {isMember ? 'Leave Challenge' : 'Join this Challenge'}
          </button>
          {loading && <Spinner className="h-4 w-4 ml-1 inline" />}
      </>
    )}
</>
  )
}
