import { CurrentUserContext } from '../utils/CurrentUserContext'
import React, { useContext, useState } from 'react'
import UserAvatar from '../components/useravatar'
import FormNote from '../components/formNote'
import { useLoaderData } from '@remix-run/react'
import FeedCommunityCard from '~/components/feedcommunitycard'
import FeedPostCard from '~/components/feedpostcard'
import type { ChallengeSummary, NoteSummary } from '../utils/types.server'
import { useMobileSize } from '../utils/useMobileSize'
import { type LoaderFunction } from '@remix-run/node'
import FeedChallengeCard from '~/components/feedchallengecard'
import { prisma } from '../models/prisma.server'
import CardChallenge from '../components/cardChallenge'
import CardNote from '~/components/cardNote'

interface FeedLoaderData {
  challenges: ChallengeSummary[]
  notes: NoteSummary[]
};
export const loader: LoaderFunction = async (args): Promise<FeedLoaderData> => {
  // if currentUser isn't authenticated, this will redirect to login
  // challenges
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
      challenge: true,
      _count: {
        select: { replies: true, likes: true }
      }
    }
  })
  return { challenges, notes }
}

export default function Home (): JSX.Element {
  const { challenges, notes } = useLoaderData() as FeedLoaderData
  const combinedArray = [...challenges, ...notes].map(item => ({
    ...item
  })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const [feedItems, setFeedItems] = useState<FeedItem[]>(combinedArray)
  const { currentUser } = useContext(CurrentUserContext)
  const isMobile = useMobileSize()
  if (!feedItems) {
    return <p>Loading...</p>
  }
  return (
         <>
            <div className='max-w-lg px-2'>
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
              <div className=" pl-2 max-w-md">
                <FormNote />
              </div>
            }
            {feedItems.map(item => {
              if ('mission' in item) {
                return (<div className="flex items-center pl-0 mt-10 max-w-lg" key={item.id}>
                          <CardChallenge challenge={item as ChallengeSummary} />
                        </div>)
              } else {
                return (<div className="flex items-center pl-0 mt-10 max-w-lg" key={item.id}>
                          <CardNote note={item} />
                        </div>)
              }
            })}

            <div className="flex items-center pl-0 mt-10 max-w-lg">
               <div className="ml-4 flex-grow text-2xl ">
                  <FeedChallengeCard />
               </div>
            </div>
            <div className="flex items-center pl-0 mt-10 max-w-lg">
               <div className="ml-4 flex-grow text-2xl ">
                  <FeedCommunityCard />
               </div>
            </div>
            <div className="flex items-center pl-0 mt-10 max-w-lg">
               <div className="ml-4 flex-grow text-2xl ">
                  <FeedPostCard />
               </div>
            </div>
         </>
  )
}
