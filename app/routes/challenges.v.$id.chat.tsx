import { useLoaderData, useRouteLoaderData, useFetcher } from '@remix-run/react'
import { useEffect, useRef, useState, useContext } from 'react'
import { requireCurrentUser } from '~/models/auth.server'
import type { Post, CheckIn, Challenge, Comment, MemberChallenge } from '~/utils/types'
import { type LoaderFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { prisma } from '~/models/prisma.server'
import CheckinsList from '~/components/checkinsList'
import FormChat from '~/components/formChat'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { CheckInButton } from '~/components/checkinButton'
import { isFuture, isPast } from 'date-fns'
import { useShouldRefresh } from '~/utils/useShouldRefresh'
interface ChallengeChatData {
  groupedData: Record<string, { posts: Post[], checkIns: { empty: CheckIn[], nonEmpty: CheckIn[] }, comments: Comment[] }>
}

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  await requireCurrentUser(args)
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
      user: {
        include: {
          profile: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  // get list of checkins with bodies
  const checkIns = await prisma.checkIn.findMany({
    where: {
      challengeId: Number(params.id),
      OR: [
        { body: { not: null } },
        { imageMeta: { not: null } },
        { videoMeta: { not: null } }
      ]
    },
    include: {
      user: {
        include: {
          profile: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  })
  const comments = await prisma.comment.findMany({
    where: {
      challengeId: Number(params.id),
      replyToId: null
    },
    include: {
      user: {
        include: {
          profile: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  // group posts, comments and checkins by date
  const groupedData: Record<string, { posts: Post[], checkIns: { empty: CheckIn[], nonEmpty: CheckIn[] }, comments: Comment[] }> = {}

  posts.forEach(post => {
    const date = post.publishAt ? post.publishAt.toISOString().split('T')[0] : post.createdAt.toISOString().split('T')[0]
    if (!groupedData[date]) {
      groupedData[date] = { posts: [], checkIns: { empty: [], nonEmpty: [] }, comments: [] }
    }
    groupedData[date].posts.push(post)
  })

  comments.forEach(comment => {
    const date = comment.createdAt.toISOString().split('T')[0]
    if (!groupedData[date]) {
      groupedData[date] = { posts: [], checkIns: { empty: [], nonEmpty: [] }, comments: [] }
    }
    groupedData[date].comments.push(comment)
  })

  checkIns.forEach(checkIn => {
    const date = checkIn.createdAt.toISOString().split('T')[0]
    if (!groupedData[date]) {
      groupedData[date] = { posts: [], checkIns: { empty: [], nonEmpty: [] }, comments: [] }
    }
    if (checkIn.body !== null || checkIn.imageMeta !== null || checkIn.videoMeta !== null) {
      groupedData[date].checkIns.nonEmpty.push(checkIn as unknown as CheckIn)
    } else {
      groupedData[date].checkIns.empty.push(checkIn as unknown as CheckIn)
    }
  })

  const data: ChallengeChatData = { groupedData }
  return data
}
export default function ViewChallengeChat (): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const { groupedData } = useLoaderData<ChallengeChatData>()
  const bottomRef = useRef<HTMLDivElement>(null)
  const { shouldRefresh } = useShouldRefresh()
  const { challenge, membership } = useRouteLoaderData<{ challenge: Challenge, membership: MemberChallenge }>('routes/challenges.v.$id') as unknown as { challenge: Challenge, membership: MemberChallenge }
  if (!groupedData) {
    return <p>No data.</p>
  }
  const shouldRefreshRef = useRef(shouldRefresh)
  const fetcher = useFetcher()

  useEffect(() => {
    shouldRefreshRef.current = shouldRefresh
  }, [shouldRefresh])

  const hasRunOnceRef = useRef(false) // flag to track that if the scroll to end has run. previously it was running on every revalidation
  useEffect(() => {
    if (!hasRunOnceRef.current) { // Check if the effect has already run
      // don't scroll if there is an anchor in the URL
      if (window.location.hash) {
        const anchor = document.querySelector(window.location.hash)
        if (anchor) {
          anchor.scrollIntoView({ behavior: 'smooth' })
        }
      } else {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
      hasRunOnceRef.current = true // Set the flag to true after running
    }
  }, []) // Empty dependency array to ensure it runs only once

  // refetch data every 10 seconds in case someone else has checked in or commented
  useEffect(() => {
    const refreshChat = setInterval(() => {
      if (shouldRefreshRef.current) {
        fetcher.load(window.location.pathname) // Reload only the current route data
      }
    }, 10000)

    // Cleanup interval on component unmount
    return () => { clearInterval(refreshChat) }
  }, [])
  const inputRef = useRef<HTMLInputElement>(null)
  const [newestComment, setNewestComment] = useState<Comment | null>(null)
  const afterSaveComment = (comment: Comment): void => {
    // only saved comments will have an id
    if (newestComment?.id) {
      // merge the existing newest comment in the groupedData with the new comment
      const date = new Date(newestComment.createdAt).toISOString().split('T')[0]
      const group = groupedData[date]
      if (group) {
        group.comments = group.comments.map(c => c.id === comment.id
          ? {
              ...comment,
              createdAt: comment.createdAt.toISOString(),
              updatedAt: comment.updatedAt.toISOString(),
              challenge: comment.challenge as unknown as Challenge
              // ... other properties if needed
            }
          : c)
      }
    }
    setNewestComment(comment)
  }
  function canCheckIn (): boolean {
    return Boolean(currentUser) && membership && !hasCheckedInToday && !isFuture(challenge.startAt) && !isPast(challenge.endAt)
  }
  const onPendingComment = (comment: Comment): void => {
    setNewestComment(comment)
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  const onSaveCommentError = (): void => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  const checkedInToday = (): boolean => {
    if (!currentUser) {
      return false
    }
    const today = new Date().toISOString().split('T')[0]
    const nonEmptyCheckIns = Object.values(groupedData).some((group) =>
      group.checkIns.nonEmpty.some((checkIn) => {
        const checkInDate = new Date(checkIn.createdAt).toISOString().split('T')[0]
        return checkIn.userId === currentUser?.id && checkInDate === today
      })
    )
    if (nonEmptyCheckIns) {
      return true
    }
    return Object.values(groupedData).some((group) =>
      group.checkIns.empty.some((checkIn) => {
        const checkInDate = new Date(checkIn.createdAt).toISOString().split('T')[0]
        return checkIn.userId === currentUser?.id && checkInDate === today
      })
    )
  }
  const [hasCheckedInToday, setHasCheckedInToday] = useState(checkedInToday())
  const handleAfterCheckIn = (checkIn: CheckIn): void => {
    setHasCheckedInToday(true)
    const date = new Date(checkIn.createdAt).toISOString().split('T')[0]
    if (!groupedData[date]) {
      groupedData[date] = { posts: [], checkIns: { empty: [], nonEmpty: [] }, comments: [] }
    }
    if (checkIn.body !== null || checkIn.imageMeta !== null || checkIn.videoMeta !== null) {
      groupedData[date].checkIns.nonEmpty.push(checkIn as unknown as CheckIn)
    } else {
      groupedData[date].checkIns.empty.push(checkIn as unknown as CheckIn)
    }
  }
  const today = new Date().toISOString().split('T')[0]
  // flag to check if today is in the groupedData. f not we'll need to add an empty block to hold it
  const hasToday = Object.keys(groupedData).includes(today)
  return (

        <div className='max-w-2xl'>
          <p>Should refresh: {shouldRefresh ? 'true' : 'false'}</p>
          {/* had to add this additional date sorting because javascript objects don't always follow the order of insertion */}
          {Object.entries(groupedData)
            .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
            .map(([date, { posts, checkIns, comments }]) => {
              const isToday = date === today
              return (

                <CheckinsList key={date} posts={posts as Post[]} comments={comments as unknown as Comment[] } newestComment={newestComment} checkIns={checkIns.nonEmpty as unknown as CheckIn[]} allowComments={true} />
              )
            })}
            {/* this is an additional block for today's date if it doesn't exist in the groupedData */}
          {!hasToday && (
                <CheckinsList
                  key={today}
                  date={today}
                  posts={[]}
                  checkIns={[]}
                  comments={[]}
                  newestComment={newestComment}
                />
          )}

          {currentUser &&
          <div className='fixed w-full max-w-2xl bottom-0  bg-white bg-opacity-70' >
            {canCheckIn() && (
                <>
                <div className="flex justify-between items-center my-4">
                  <p>You have not checked in today</p>
                  <CheckInButton challenge={challenge} memberChallenge={membership} label='Check In Now' afterCheckIn={handleAfterCheckIn} size='sm'/>
                </div>
                </>
            )}
            <FormChat
              afterSave={afterSaveComment}
              prompt="Sound off..."
              onPending={onPendingComment}
              onError={onSaveCommentError}
              objectId={challenge.id}
              type={'challenge'}
              inputRef={inputRef}
              autoFocus={!window.location.hash}
            />
          </div>
          }
          {/* this is a spacer at the bottom that the app scrolls to on load */}
          <div ref={bottomRef} className='min-h-[50px]'></div>
        </div>

  )
}
