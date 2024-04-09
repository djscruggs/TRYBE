import { CurrentUserContext } from '../utils/CurrentUserContext'
import React, { useContext, useState, useEffect } from 'react'
import UserAvatar from '../components/useravatar'
import FormNote from '../components/formNote'
import { useLoaderData, useNavigate } from '@remix-run/react'
import type { ChallengeSummary, NoteSummary } from '../utils/types.server'
import { useMobileSize } from '../utils/useMobileSize'
import { type LoaderFunction } from '@remix-run/node'
import { prisma } from '../models/prisma.server'
import CardChallenge from '../components/cardChallenge'
import CardNote from '~/components/cardNote'
import { useRevalidator } from 'react-router-dom'

interface FeedLoaderData {
  challenges: ChallengeSummary[]
  notes: NoteSummary[]
};
export const loader: LoaderFunction = async (args): Promise<FeedLoaderData> => {
  const challenges = await prisma.challenge.findMany({
    orderBy: [{ createdAt: 'desc' }],
    include: {
      user: {
        include: {
          profile: true
        }
      },
      _count: {
        select: { members: true, comments: true, likes: true }
      }
    }

  })
  const notes = await prisma.note.findMany({
    orderBy: [{ createdAt: 'desc' }],
    include: {
      user: {
        include: {
          profile: true
        }
      },
      replyTo: true,
      challenge: true,
      _count: {
        select: { replies: true, likes: true }
      }

    }
  })
  return { challenges, notes }
}
interface FeedItem {
  id?: string
  createdAt?: Date
  updatedAt?: Date
}
export default function Home (): JSX.Element {
  const { challenges, notes } = useLoaderData<FeedLoaderData>()
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  useEffect(() => {
    const combinedArray = [...challenges, ...notes].map(item => ({
      ...item
    })).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    setFeedItems(combinedArray)
  }, [challenges, notes])
  const { currentUser } = useContext(CurrentUserContext)
  const isMobile = useMobileSize()
  const revalidator = useRevalidator()
  const onSavePost = (): void => {
    revalidator.revalidate()
  }
  if (!currentUser || !feedItems) {
    return <p>Loading...</p>
  }
  return (
         <>
            <div className='w-full max-w-lg px-2'>
               <div className="flex items-center pl-0 mt-10 max-w-lg">
                  <div className="flex-grow-0 justify-self-start">
                     <UserAvatar size={isMobile ? 'md' : 'xxl'} />
                  </div>
                  {currentUser?.profile &&
                  <div className={`ml-4 flex-grow text-${isMobile ? 'l' : '4xl'}`}>
                     <h1>Hello, {currentUser.profile.firstName}</h1>
                  </div>
                  }
                  </div>
                  <div className="flex items-center justify-between w-full max-w-lg mt-10">
                  <div className="flex-grow-0">
                     <h2 className="flex-grow-0">Updates</h2>
                  </div>

               </div>
            </div>
            {currentUser &&
              <div className="w-full pl-2 max-w-lg">
                <FormNote afterSave={onSavePost} />
              </div>
            }
            {feedItems.map(item => {
              if ('mission' in item) {
                return (<div className="flex items-center pl-0 mt-10 w-full max-w-lg" key={item.id}>
                          <CardChallenge challenge={item as ChallengeSummary} />
                        </div>)
              } else {
                return (<div className="flex items-center pl-0 mt-10 w-full max-w-lg" key={item.id}>
                          <CardNote note={item} />
                        </div>)
              }
            })}
         </>
  )
}
