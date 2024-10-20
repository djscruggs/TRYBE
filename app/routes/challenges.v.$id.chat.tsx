import { useLoaderData, useRouteLoaderData, useFetcher } from '@remix-run/react'
import { useLayoutEffect, useEffect, useRef, useState, useContext } from 'react'
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
import { convertToLocalDateString } from '~/utils/helpers'
interface ChallengeChatData {
  groupedData: Record<string, { posts: Post[], checkIns: { empty: CheckIn[], nonEmpty: CheckIn[] }, comments: Comment[] }>
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
    const date = post.publishAt ? convertToLocalDateString(currentUser, post.publishAt) : convertToLocalDateString(currentUser, post.createdAt)
    if (!groupedData[date]) {
      groupedData[date] = { posts: [], checkIns: { empty: [], nonEmpty: [] }, comments: [] }
    }
    groupedData[date].posts.push(post)
  })

  comments.forEach(comment => {
    const date = convertToLocalDateString(currentUser, comment.createdAt)
    if (!groupedData[date]) {
      groupedData[date] = { posts: [], checkIns: { empty: [], nonEmpty: [] }, comments: [] }
    }
    groupedData[date].comments.push(comment)
  })

  checkIns.forEach(checkIn => {
    const date = convertToLocalDateString(currentUser, checkIn.createdAt)
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
  const [showBottomBar, setShowBottomBar] = useState(false)
  const fetcher = useFetcher()
  const postRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    shouldRefreshRef.current = shouldRefresh
  }, [shouldRefresh])

  const hasRunOnceRef = useRef(false)
  const renderCountRef = useRef(0) // Track render count

  useEffect(() => {
    renderCountRef.current += 1
  })

  useLayoutEffect(() => {
    const scrollToAnchorOrBottom = () => {
      const postId = window.location.hash.replace('#post-', '')
      if (postId && postRefs.current[postId]) {
        postRefs.current[postId]?.scrollIntoView({ behavior: 'smooth' })
      } else {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }

    const handleLoad = (): void => {
      if (!hasRunOnceRef.current) {
        hasRunOnceRef.current = true
        scrollToAnchorOrBottom()
        setShowBottomBar(true)
      }
    }

    const observer = new MutationObserver(() => {
      if (!hasRunOnceRef.current) {
        hasRunOnceRef.current = true
        scrollToAnchorOrBottom()
        setShowBottomBar(true)
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })

    window.addEventListener('load', handleLoad)
    window.addEventListener('resize', handleLoad)

    return () => {
      observer.disconnect()
      window.removeEventListener('load', handleLoad)
      window.removeEventListener('resize', handleLoad)
    }
  }, [])

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
    const today = new Date().toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split('/').reverse().join('-')
    const todayGroup = groupedData[today]
    if (!todayGroup) {
      return false
    }
    const hasNonEmptyCheckIn = todayGroup.checkIns.nonEmpty.some(checkIn => checkIn.userId === currentUser?.id)
    const hasEmptyCheckIn = todayGroup.checkIns.empty.some(checkIn => checkIn.userId === currentUser?.id)
    return hasNonEmptyCheckIn || hasEmptyCheckIn
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
  const today = convertToLocalDateString(currentUser, new Date())
  // flag to check if today is in the groupedData. f not we'll need to add an empty block to hold it
  const hasToday = Object.keys(groupedData).includes(today)

  const prevGroupedDataRef = useRef(groupedData)
  const prevShouldRefreshRef = useRef(shouldRefresh)

  useEffect(() => {
    if (prevGroupedDataRef.current !== groupedData) {
      prevGroupedDataRef.current = groupedData
    }
    if (prevShouldRefreshRef.current !== shouldRefresh) {
      prevShouldRefreshRef.current = shouldRefresh
    }
  }, [groupedData, shouldRefresh])

  return (

        <div className='max-w-2xl'>
          {/* had to add this additional date sorting because javascript objects don't always follow the order of insertion */}
          {Object.entries(groupedData)
            .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
            .map(([date, { posts, checkIns, comments }], index) => { // Add index here
              return (
                <div key={date} ref={el => { postRefs.current[date] = el }}>
                  <CheckinsList
                    id={`checkins-${index}`} // Add the id here
                    posts={posts as Post[]}
                    comments={comments as unknown as Comment[]}
                    newestComment={newestComment}
                    checkIns={checkIns.nonEmpty as unknown as CheckIn[]}
                    allowComments={true}
                  />
                </div>
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

          {currentUser && showBottomBar &&
            <div className='fixed w-full max-w-2xl bottom-0  bg-white bg-opacity-70' >
              {!hasCheckedInToday && (
                <div className="flex justify-between items-center my-4">
                  <p>You have not checked in today</p>
                  <CheckInButton challenge={challenge} memberChallenge={membership} label='Check In Now' afterCheckIn={handleAfterCheckIn} size='sm'/>
                </div>
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
          <div ref={bottomRef} className={`min-h-[${hasCheckedInToday ? '50px' : '100px'}]`}></div>
        </div>

  )
}
