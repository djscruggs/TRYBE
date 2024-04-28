import { loadChallengeSummary } from '~/models/challenge.server'
import { Outlet, useLoaderData, Link, useNavigate, useLocation } from '@remix-run/react'
import React, { useContext, useState } from 'react'
import { requireCurrentUser } from '../models/auth.server'
import type { MemberChallenge, ChallengeSummary, Post } from '~/utils/types'
import { json, type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { colorToClassName, convertlineTextToJSX, iconStyle } from '~/utils/helpers'
import { type DateTimeFormatOptions } from 'intl'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import { Spinner, Button } from '@material-tailwind/react'
import { GiShinyApple, GiMeditation } from 'react-icons/gi'
import { FaRegLightbulb } from 'react-icons/fa6'
import { RiMentalHealthLine } from 'react-icons/ri'
import { PiBarbellLight } from 'react-icons/pi'
import { IoFishOutline } from 'react-icons/io5'
import { FaRegComment } from 'react-icons/fa'
import { LiaUserFriendsSolid } from 'react-icons/lia'
import { prisma } from '../models/prisma.server'
import { TbHeartFilled } from 'react-icons/tb'
import { useRevalidator } from 'react-router-dom'
import { formatDistanceToNow, format, differenceInDays, differenceInHours } from 'date-fns'
import CardPost from '~/components/cardPost'
import getUserLocale from 'get-user-locale'
import Liker from '~/components/liker'

interface ViewChallengePostsData {
  posts: Post[]
  loadingError?: string | null
}

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  const currentUser = await requireCurrentUser(args)
  const { params } = args
  if (!params.id) {
    return null
  }

  // load posts
  const posts = await prisma.post.findMany({
    where: {
      AND: {
        challengeId: Number(params.id),
        published: true,
        OR: [
          { publishAt: null },
          { publishAt: { lte: new Date() } }
        ]
      }
    },
    include: {
      _count: {
        select: { comments: true, likes: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  const data: ViewChallengePostsData = { posts }
  return json(data)
}
export default function ViewChallenge (): JSX.Element {
  const data: ViewChallengePostsData = useLoaderData() as ViewChallengePostsData
  const { posts } = data
  const { currentUser } = useContext(CurrentUserContext)
  const navigate = useNavigate()

  if (!data) {
    return <p>No data.</p>
  }
  if (data?.loadingError) {
    return <h1>{data.loadingError}</h1>
  }
  return (
    <>
      {posts.map((post) => {
        return (
            <div key={`post-${post.id}`} className='max-w-sm md:max-w-md lg:max-w-lg'>
              <CardPost post={post} hideMeta={true}/>
            </div>
        )
      })}
      <div className='mb-16'>
        <Outlet />
      </div>
</>
  )
}
