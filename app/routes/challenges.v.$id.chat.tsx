import { useLoaderData, useRouteLoaderData, useRevalidator } from '@remix-run/react'
import { useEffect, useRef, useState, useContext } from 'react'
import { requireCurrentUser } from '~/models/auth.server'
import type { Post, CheckIn, Challenge, Comment, MemberChallenge } from '~/utils/types'
import { json, type LoaderFunction, type LoaderFunctionArgs, type SerializeFrom } from '@remix-run/node'
import { prisma } from '~/models/prisma.server'
import { Prisma } from '@prisma/client'
import CheckinsList from '~/components/checkinsList'
import FormChat from '~/components/formChat'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import DialogCheckin from '~/components/dialogCheckin'
import DialogPost from '~/components/dialogPost'
import { CheckInButton } from '~/components/checkinButton'
import DateDivider from '~/components/dateDivider'

interface ChallengeChatData {
  groupedData: Record<string, { posts: Post[], checkIns: { empty: CheckIn[], nonEmpty: CheckIn[] }, comments: Comment[] }>
}
type GroupedDataEntry = SerializeFrom<ChallengeChatData['groupedData']>
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
        { imageMeta: { not: Prisma.JsonNull } },
        { videoMeta: { not: Prisma.JsonNull } }
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
  const groupedData: ChallengeChatData['groupedData'] = {}

  posts.forEach(post => {
    const date = post.publishAt ? post.publishAt.toLocaleDateString('en-CA') : post.createdAt.toLocaleDateString('en-CA')
    if (!groupedData[date]) {
      groupedData[date] = { posts: [], checkIns: { empty: [], nonEmpty: [] }, comments: [] }
    }
    groupedData[date].posts.push(post as unknown as Post)
  })

  comments.forEach(comment => {
    const date = comment.createdAt.toLocaleDateString('en-CA')
    if (!groupedData[date]) {
      groupedData[date] = { posts: [], checkIns: { empty: [], nonEmpty: [] }, comments: [] }
    }
    groupedData[date].comments.push(comment)
  })

  checkIns.forEach(checkIn => {
    const date = checkIn.createdAt.toLocaleDateString('en-CA')
    if (!groupedData[date]) {
      groupedData[date] = { posts: [], checkIns: { empty: [], nonEmpty: [] }, comments: [] }
    }
    const formattedCheckIn = {
      ...checkIn,
      createdAt: new Date(checkIn.createdAt).toISOString(),
      updatedAt: new Date(checkIn.updatedAt).toISOString()
    }
    if (checkIn.body !== null || checkIn.imageMeta !== null || checkIn.videoMeta !== null) {
      groupedData[date].checkIns.nonEmpty.push(formattedCheckIn as unknown as CheckIn)
    } else {
      groupedData[date].checkIns.empty.push(formattedCheckIn as unknown as CheckIn)
    }
  })

  // Sort the groupedData by date
  const sortedGroupedData = Object.entries(groupedData)
    .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())

  const data: ChallengeChatData = { groupedData: Object.fromEntries(sortedGroupedData) }
  return json(data)
}

export default function ViewChallengeChat (): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const loaderData = useLoaderData<ChallengeChatData>()
  const [groupedData, setGroupedData] = useState<GroupedDataEntry>(loaderData.groupedData) // Initialize state with loader data
  const bottomRef = useRef<HTMLDivElement>(null)
  const { challenge } = useRouteLoaderData<{ challenge: Challenge, membership: MemberChallenge }>('routes/challenges.v.$id') as unknown as { challenge: Challenge, membership: MemberChallenge }
  if (!groupedData) {
    return <p>No data.</p>
  }

  // have to resort the groupedData by date because the data from loader is not guaranteed to be in order
  const postRefs = useRef<Record<string, HTMLDivElement | null>>({})
  // find highlighted post in hash
  const highlightedPostId = Number(window.location.hash.replace('#post-', ''))
  const _highlightedPost = Object.entries(groupedData).find(([date, { posts }]) => posts.some(p => p.id === highlightedPostId))
  const highlightedPost = _highlightedPost ? _highlightedPost[1].posts.find(p => p.id === highlightedPostId) : null
  const [showHighlightedPost, setShowHighlightedPost] = useState(Boolean(highlightedPost))
  const [dayCount, setDayCount] = useState(20)
  const [limitedGroupedData, setLimitedGroupedData] = useState<GroupedDataEntry>(getCorrectDays(groupedData))
  const [newestComment, setNewestComment] = useState<Comment | null>(null)
  // used in various places to get the current date formatted as YYYY-MM-DD
  const today = new Date().toLocaleDateString('en-CA')
  const scrollToAnchorOrBottom = (): void => {
    if (highlightedPostId && postRefs.current[highlightedPostId]) {
      postRefs.current[highlightedPostId]?.scrollIntoView({ behavior: 'smooth' })
    } else {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }
  useEffect(() => {
    scrollToAnchorOrBottom()
  }, [])

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
    const todayGroup = groupedData[today]
    if (!todayGroup) {
      return false
    }
    const hasNonEmptyCheckIn = todayGroup.checkIns.nonEmpty.some(checkIn => checkIn.userId === currentUser?.id)
    const hasEmptyCheckIn = todayGroup.checkIns.empty.some(checkIn => checkIn.userId === currentUser?.id)
    return hasNonEmptyCheckIn || hasEmptyCheckIn
  }
  // used to maintain the number of days we show after a fetch

  const [hasCheckedInToday, setHasCheckedInToday] = useState(checkedInToday())
  const [showDialogPopup, setShowDialogPopup] = useState(!hasCheckedInToday)
  const revalidator = useRevalidator()
  const handleAfterCheckIn = (checkIn: CheckIn): void => {
    setDayCount(dayCount + 1)
    setHasCheckedInToday(true)
    setHasToday(true)
    revalidator.revalidate()
    // const date = new Date().toISOString().split('T')[0]
    // const newGroupedData = { ...groupedData }
    // if (!newGroupedData[date]) {
    //   newGroupedData[date] = { posts: [], checkIns: { empty: [], nonEmpty: [] }, comments: [] }
    // }
    // if (checkIn.body !== null || checkIn.imageMeta !== null || checkIn.videoMeta !== null) {
    //   newGroupedData[date].checkIns.nonEmpty.push(checkIn)
    // } else {
    //   newGroupedData[date].checkIns.empty.push(checkIn)
    // }
    // setGroupedData(newGroupedData)
    // setLimitedGroupedData(getCorrectDays(newGroupedData))
    // setHasCheckedInToday(true)
    // setHasToday(true)
  }

  // flag to check if today is in the groupedData. if not we'll need to add an empty block to hold it
  const [hasToday, setHasToday] = useState(Object.keys(groupedData).includes(today))
  // Define the type for limitedGroupedData

  // by default we only show the last five days
  // BUT if they are linked to a post we want to show that day no matter what, everything else with it
  function getCorrectDays (data: GroupedDataEntry): GroupedDataEntry {
    let postDate: string | null = null
    if (highlightedPost) {
      postDate = highlightedPost.publishAt ? new Date(highlightedPost.publishAt).toISOString().split('T')[0] : new Date(highlightedPost.createdAt ?? new Date()).toISOString().split('T')[0]
    }
    // If postDate is defined, find its index and slice everything before it
    let startIndex = 0 - dayCount
    if (postDate) {
      const dates = Object.keys(data)
      startIndex = dates.indexOf(postDate)
      // always return at least the last five days
      // so if startIndex is only in e.g. the last two days we'll return the last five days
      if (dates.length - startIndex < dayCount) {
        startIndex = 0 - dayCount
      }
    }
    // Get the last five entries starting from the postDate or the beginning
    const latestEntries = Object.entries(data).slice(startIndex)
    // transform back into object keyed by date
    const latestEntriesObject = Object.fromEntries(latestEntries)
    return latestEntriesObject
  }

  const handleCloseHighlightedPost = (): void => {
    setShowHighlightedPost(false)
    if (highlightedPostId && postRefs.current[highlightedPostId]) {
      postRefs.current[highlightedPostId]?.scrollIntoView({ behavior: 'smooth' })
    }
  }
  useEffect(() => {
    setGroupedData(loaderData.groupedData)
    setLimitedGroupedData(getCorrectDays(loaderData.groupedData))
    setHasCheckedInToday(checkedInToday())
    setHasToday(Object.keys(loaderData.groupedData).includes(today))
    scrollToAnchorOrBottom()
  }, [loaderData])
  return (
    <div className='max-w-2xl'>
      {limitedGroupedData && Object.entries(limitedGroupedData)?.map(([date, { posts, checkIns, comments }], index) => (

        <div
          key={date}
          ref={el => {
            postRefs.current[date] = el
            if (highlightedPostId && posts.some((post) => post.id === highlightedPostId)) {
              postRefs.current[highlightedPostId] = el
            }
          }}
        >
          <CheckinsList
            id={`checkins-${index}`}
            posts={posts as Post[]}
            comments={comments as unknown as Comment[]}
            newestComment={newestComment}
            checkIns={[...checkIns.empty, ...checkIns.nonEmpty] as CheckIn[]}
            allowComments={true}
            date={date}
          />
        </div>
      ))}
      {/* this is an additional block for today's date if it doesn't exist in the groupedData */}
      {!hasToday && (
        <DateDivider date={today} />
      )}

      {currentUser && (
        <div className='fixed w-full max-w-2xl bottom-0  bg-white bg-opacity-70' >
          {!highlightedPost && showDialogPopup && (
            <DialogCheckin challenge={challenge} open={true} onClose={() => { setShowDialogPopup(false) }} afterCheckIn={handleAfterCheckIn} />
          )}
          <FormChat
            afterSave={afterSaveComment}
            prompt="Sound off..."
            onPending={onPendingComment}
            onError={onSaveCommentError}
            objectId={challenge.id}
            type={'challenge'}
            autoFocus={!window.location.hash}
          />
        </div>
      )}
      {highlightedPost && (
        <DialogPost post={highlightedPost as Post} open={showHighlightedPost} onClose={handleCloseHighlightedPost} >
          {!hasCheckedInToday &&
            <div className='flex items-center justify-center mt-4'>
              <CheckInButton challenge={challenge} afterCheckIn={handleAfterCheckIn} />
            </div>
          }
        </DialogPost>
      )}
      {/* this is a spacer at the bottom that the app scrolls to on load */}
      <div ref={bottomRef} className={`min-h-[${hasCheckedInToday ? '50px' : '100px'}]`}></div>
    </div>
  )
}
