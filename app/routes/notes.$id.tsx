import { loadNoteSummary } from '~/models/note.server'
import { Outlet, useLoaderData, Link, useNavigate, useLocation } from '@remix-run/react'
import React, { useContext, useState } from 'react'
import CardNote from '~/components/cardNote'
import { requireCurrentUser } from '../models/auth.server'
import type { ObjectData, Note } from '~/utils/types.server'
import { json, type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import { Spinner } from '@material-tailwind/react'
import { prisma } from '../models/prisma.server'
import { useRevalidator } from 'react-router-dom'

interface NoteObjectData {
  note: Note
  hasLiked: boolean
}

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  const currentUser = await requireCurrentUser(args)
  const { params } = args
  if (!params.id) {
    return null
  }
  const result = await loadNoteSummary(params.id)
  if (!result) {
    const error = { loadingError: 'Challenge not found' }
    return json(error)
  }
  // load memberships & likes for current user if it exists
  if (currentUser) {
    // has the user liked this note?
    const likes = await prisma.like.count({
      where: {
        noteId: parseInt(params.id),
        userId: currentUser.id
      }
    })
    console.log('likes', likes)
  }
  const data: NoteObjectData = { note: result }
  return json(data)
}
export default function ViewNote (): JSX.Element {
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
  if (!data?.note) {
    return <p>Loading...</p>
  }

  return (
    <div className='max-w-[600px] mt-10'>
      <CardNote note={data.note} />
    </div>
  )
}
