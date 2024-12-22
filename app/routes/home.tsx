import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { getCurrentUser } from '~/models/auth.server'
import { likesByType } from '~/models/like.server'
import { useContext, useState, useEffect } from 'react'
import UserAvatar from '~/components/useravatar'
import FormNote from '~/components/formNote'
import { useLoaderData, type MetaFunction } from '@remix-run/react'
import type { ChallengeSummary, NoteSummary } from '~/utils/types'
import { useMobileSize } from '~/hooks/useMobileSize'
import { type LoaderFunction } from '@remix-run/node'
import { prisma } from '~/models/prisma.server'
import CardChallenge from '~/components/cardChallenge'
import CardNote from '~/components/cardNote'
import getRandomQuote from '~/utils/quotes'

interface FeedLoaderData {
  challenges: ChallengeSummary[]
  notes: NoteSummary[]
  likes: Record<string, number[]>
};
export const meta: MetaFunction = () => {
  return [{ title: 'TRYBE Home' }]
}

export const loader: LoaderFunction = async (args): Promise<FeedLoaderData> => {
  const currentUser = await getCurrentUser(args)
  const challenges = await prisma.challenge.findMany({
    orderBy: [{ createdAt: 'desc' }],
    where: {
      OR: [
        { userId: currentUser?.id ?? 0 },
        { public: true }
      ]
    },
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
    where: {
      isThread: false,
      AND: [
        { replyTo: null },
        { isShare: false }
      ]
    },
    include: {
      user: {
        include: {
          profile: true
        }
      },
      replyTo: {
        include: {
          user: {
            include: {
              profile: true
            }
          }
        }
      },
      challenge: {
        include: {
          user: {
            include: {
              profile: true
            }
          },
          members: {
            include: {
              user: true
            },
            where: {
              userId: currentUser?.id ?? 0
            }
          },
          _count: {
            select: { members: true, comments: true, likes: true }
          }
        }
      },
      post: {
        include: {
          user: {
            include: {
              profile: true
            }
          }
        }
      },
      _count: {
        select: { replies: true, likes: true }
      }

    }
  })
  const _memberships = await prisma.memberChallenge.findMany({
    where: {
      userId: currentUser ? Number(currentUser.id) : 0
    }
  })
  // creats an array that just has the challengeIds
  const memberships = [
    ..._memberships.map(membership => membership.challengeId),
    ...challenges.filter(challenge => challenge.userId === currentUser?.id).map(challenge => challenge.id)
  ]
  const likes = await likesByType({ userId: currentUser?.id ?? 0 })
  return { challenges, notes, memberships, likes }
}
interface FeedItem {
  id?: string
  createdAt?: Date
  updatedAt?: Date
}

export default function Home (): JSX.Element {
  const data = useLoaderData<typeof loader>()
  const { challenges, memberships, likes } = data
  const [notes, setNotes] = useState<NoteSummary[]>(data.notes as unknown as NoteSummary[])
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  useEffect(() => {
    const combinedArray = [...challenges, ...notes].map(item => ({
      ...item
    })).sort((a, b) => new Date(b.updatedAt as Date).getTime() - new Date(a.updatedAt as Date).getTime())
    setFeedItems(combinedArray)
  }, [challenges, notes])
  const { currentUser } = useContext(CurrentUserContext)
  const isMobile = useMobileSize()
  const onSaveNote = (newNote: NoteSummary): void => {
    setNotes([newNote, ...notes])
  }
  if (!feedItems) {
    return <p>Loading...</p>
  }

  return (

          <div className='flex-cols cols-1 justify-center max-w-xl mb-16'>
            <div className='w-full flex items-center max-w-2xl px-2 mt-10 '>
            <div className='flex items-center justify-center max-w-xl'>
                  <div className="flex-grow-0 justify-self-start mb-2">
                     <UserAvatar size={isMobile ? 'md' : 'xl'} />
                  </div>
                  {currentUser?.profile &&
                  <div className={`ml-4 flex-grow text-${isMobile ? 'l' : '4xl'}`}>
                     <h1>Hello, {currentUser.profile.firstName}</h1>
                  </div>
                  }
                  </div>

            </div>
            {currentUser &&
              <div className="w-full flex items-center pl-2 max-w-lg">
                <FormNote afterSave={onSaveNote} />
              </div>
            }

            {feedItems.map(item => {
              if ('mission' in item) {
                return (<div className="pl-0 mt-4 w-full max-w-lg" key={`challenge-${item.id}`}>
                          <CardChallenge challenge={item as unknown as ChallengeSummary} isMember={memberships.includes(item.id)} />
                        </div>)
              } else {
                return (<div className=" pl-0 mt-4 w-full max-w-lg" key={`note-${item.id}`}>
                          <CardNote note={item} />
                        </div>)
              }
            })}

          </div>
  )
}
