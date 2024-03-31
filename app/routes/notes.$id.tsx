import { loadNoteSummary, loadRepost } from '~/models/note.server'
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
    const error = { loadingError: 'Note not found' }
    return json(error)
  }
  // load memberships & likes for current user if it exists
  let hasReposted = false
  let hasLiked = false
  if (currentUser) {
    // has the user liked this note?
    const likes = await prisma.like.count({
      where: {
        noteId: parseInt(params.id),
        userId: currentUser.id
      }
    })
    hasLiked = likes > 0
    // has the user reposted this note?
    const reposted = await loadRepost(parseInt(params.id), currentUser?.id, null)
    if (reposted) {
      hasReposted = true
    }
  }
  // get cound of resposts
  const repostCount = await prisma.note.count({
    where: {
      replyToId: parseInt(params.id),
      body: null
    }
  })
  // get replies
  const replies = await prisma.note.findMany({
    where: {
      replyToId: parseInt(params.id),
      body: {
        not: null
      }
    }
  })
  const data: NoteObjectData = { note: result, hasLiked, hasReposted, repostCount, replies }
  return json(data)
}

export default function ViewNote (): JSX.Element {
  const location = useLocation()
  if (location.pathname.includes('edit') || location.pathname.includes('quote')) {
    return <Outlet />
  }

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
  console.log('replies', data.replies)
  return (
    <>
    <div className='max-w-[400px] mt-10'>
      <CardNote note={data.note} repostCount={data.repostCount} hasLiked={Boolean(data.hasLiked)} hasReposted={Boolean(data.hasReposted)} />
    </div>
    <div className='max-w-[400px]'>
      {data.replies?.map((reply) => {
        return <CardNote key={reply.id} note={reply} isReplyTo={true} />
      })}
    </div>
    </>
  )
}
