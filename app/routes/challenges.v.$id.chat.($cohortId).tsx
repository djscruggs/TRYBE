import { useLoaderData, useRouteLoaderData } from '@remix-run/react'
import { useEffect, useRef, useState, useContext } from 'react'
import { requireCurrentUser } from '~/models/auth.server'
import type { Post, CheckIn, Challenge, Comment } from '~/utils/types'
import { json, type MetaFunction, type LoaderFunction, type LoaderFunctionArgs, type SerializeFrom, redirect } from '@remix-run/node'
import { prisma } from '~/models/prisma.server'
import { type MemberChallenge, Prisma } from '@prisma/client'
import CheckinsList, { CheckinRow } from '~/components/checkinsList'
import FormChat from '~/components/formChat'
import { CurrentUserContext } from '~/contexts/CurrentUserContext'
import { useMemberContext } from '~/contexts/MemberContext'
import DialogCheckin from '~/components/dialogCheckin'
import DialogPost from '~/components/dialogPost'
import { CheckInButton } from '~/components/checkinButton'
import DateDivider from '~/components/dateDivider'
import MobileBackButton from '~/components/mobileBackButton'
import HideFeedbackButton from '~/components/hideFeedbackButton'
import { hasStarted, isExpired } from '~/utils/helpers/challenge'
import { loadChallengeSummary } from '~/models/challenge.server'
import { ChatContextProvider } from '~/contexts/ChatContext'
export const meta: MetaFunction = () => {
  return [
    { title: 'Chat' },
    {
      property: 'og:title',
      content: 'Chat'
    }
  ]
}

interface ChallengeChatData {
  groupedData: Record<string, { posts: Post[], checkIns: { empty: CheckIn[], nonEmpty: CheckIn[] }, comments: Comment[] }>
}

type GroupedDataEntry = SerializeFrom<ChallengeChatData['groupedData']>

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  const currentUser = await requireCurrentUser(args)
  const { params } = args
  if (!params.id) {
    return redirect('/challenges')
  }
  const membership = await prisma.memberChallenge.findFirst({
    where: {
      userId: currentUser?.id,
      challengeId: Number(params.id),
      cohortId: Number(params.cohortId)
    }
  })
  if (!membership) {
    return redirect('/challenges/v/' + params.id + '?err=noMember')
  }

  // load the challenge
  const challenge = await loadChallengeSummary(Number(params.id))
  if (!challenge) {
    return null
  }
  // have to build the where clause for posts based on the challenge type and cohortId
  const postsWhere: Prisma.PostWhereInput = {
    challengeId: Number(params.id)
  }
  // get the current day number, but make sure it's not before the challenge start date
  let maxDayNumber
  if (challenge.type === 'SELF_LED' && params.cohortId) {
    maxDayNumber = await prisma.memberChallenge.aggregate({
      _max: {
        dayNumber: true,
        startAt: true
      },
      where: {
        startAt: {
          lte: new Date()
        },
        challengeId: Number(params.id),
        cohortId: Number(params.cohortId)
      }
    })
    postsWhere.publishOnDayNumber = {
      lte: maxDayNumber._max.dayNumber ?? 0
    }
  } else {
    postsWhere.OR = [
      { publishAt: null },
      { publishAt: { lte: new Date() } }
    ]
  }

  // load posts
  const posts = await prisma.post.findMany({
    where: postsWhere,
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
      cohortId: params.cohortId ? Number(params.cohortId) : null,
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
      cohortId: params.cohortId ? Number(params.cohortId) : null,
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
  console.log(comments)
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
    groupedData[date].comments.push(comment as unknown as Comment)
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
    if (checkIn.body || checkIn.imageMeta !== null || checkIn.videoMeta !== null) {
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
  const { membership, updated: checkInsUpdated, refreshUserCheckIns } = useMemberContext()
  const loaderData = useLoaderData<ChallengeChatData>()
  const [groupedData, setGroupedData] = useState<GroupedDataEntry>(loaderData.groupedData)
  const bottomRef = useRef<HTMLDivElement>(null)
  const { challenge } = useRouteLoaderData<{ challenge: Challenge }>('routes/challenges.v.$id') as unknown as { challenge: Challenge }
  if (!groupedData) {
    return <p>No data.</p>
  }
  // have to resort the groupedData by date because the data from loader is not guaranteed to be in order
  const postRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const chatFormRef = useRef<HTMLDivElement>(null)
  // find highlighted post in hash
  const [featuredPostId, setfeaturedPostId] = useState(Number(window.location.hash.replace('#featured-id-', '')))
  const highlightedCommentId = Number(window.location.hash.replace('#comment-', ''))
  const highlightedPostId = Number(window.location.hash.replace('#post-', ''))
  const highlightedCheckInId = Number(window.location.hash.replace('#checkIn-', ''))
  const highlightedObject = highlightedPostId
    ? 'post'
    : highlightedCheckInId
      ? 'checkin'
      : highlightedCommentId
        ? 'comment'
        : ''
  const highlightedId = highlightedPostId || (highlightedCheckInId || (highlightedCommentId || 0))
  const _featuredPost = Object.entries(groupedData).find(([date, { posts }]) => posts.some(p => p.id === featuredPostId))
  const featuredPost = _featuredPost ? _featuredPost[1].posts.find(p => p.id === featuredPostId) : null
  const [showfeaturedPost, setShowfeaturedPost] = useState(Boolean(featuredPost))
  const [dayCount, setDayCount] = useState(10)
  const [limitedGroupedData, setLimitedGroupedData] = useState<GroupedDataEntry>(getCorrectDays(groupedData))
  const started = hasStarted(challenge, membership as MemberChallenge)
  // used in various places to get the current date formatted as YYYY-MM-DD
  const today = new Date().toLocaleDateString('en-CA')
  const scrollToBottom = (): void => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  useEffect(() => {
    scrollToBottom()
  }, [])

  const checkedInToday = (): boolean => {
    if (!currentUser) {
      return true
    }
    if (!membership) {
      return true
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
  const expired = isExpired(challenge, membership)
  const [hasCheckedInToday, setHasCheckedInToday] = useState(checkedInToday())
  // only show the checkin popup if the user is logged in and they haven't checked in today, the challenge isn't expired, and there's no featured post
  const [showCheckinPopup, setShowCheckinPopup] = useState(started && membership && currentUser && !hasCheckedInToday && !expired && !featuredPost && challenge.status !== 'DRAFT')
  // flag to check if today is in the groupedData. if not we'll need to add an empty block to hold it
  const [hasToday, setHasToday] = useState(Object.keys(groupedData).includes(today))
  // Define the type for limitedGroupedData

  // by default we only show the last dayCount days
  // BUT if they are linked to a post we want to show that day no matter what, everything else with it
  function getCorrectDays (data: GroupedDataEntry): GroupedDataEntry {
    let postDate: string | null = null
    if (featuredPost) {
      postDate = featuredPost.publishAt ? new Date(featuredPost.publishAt).toISOString().split('T')[0] : new Date(featuredPost.createdAt ?? new Date()).toISOString().split('T')[0]
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
  const [newCheckIns, setNewCheckIns] = useState<CheckIn[]>([])
  useEffect(() => {
    if (checkInsUpdated) {
      refreshUserCheckIns().then((checkIns) => {
        const currentCheckIns = JSON.parse(JSON.stringify(newCheckIns))
        currentCheckIns.push(checkIns[0] as unknown as CheckIn)
        setNewCheckIns(currentCheckIns as unknown as CheckIn[])
        setDayCount(dayCount + 1)
        setHasCheckedInToday(true)
        setHasToday(true)
      }).catch((error) => {
        console.error('Error refreshing checkIns', error)
      })
    }
  }, [checkInsUpdated])
  useEffect(() => {
    scrollToBottom()
  }, [newCheckIns])
  const handleDeleteNewCheckIn = (checkIn: CheckIn): void => {
    const currentCheckIns = JSON.parse(JSON.stringify(newCheckIns))
    const index = currentCheckIns.findIndex(c => c.id === checkIn.id)
    if (index !== -1) {
      currentCheckIns.splice(index, 1)
      setNewCheckIns(currentCheckIns)
    }
  }

  const handleClosefeaturedPost = (): void => {
    setShowfeaturedPost(false)
    setfeaturedPostId(0)
    setShowfeaturedPost(false)
    window.history.replaceState(null, '', window.location.pathname)
    scrollToBottom()
  }
  const [hasEarlierDays, setHasEarlierDays] = useState(false)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  useEffect(() => {
    setGroupedData(loaderData.groupedData)
    const daysToDisplay = getCorrectDays(loaderData.groupedData)
    if (Object.keys(loaderData.groupedData).length > Object.keys(daysToDisplay).length) {
      setHasEarlierDays(true)
    } else {
      setHasEarlierDays(false)
    }
    setLimitedGroupedData(daysToDisplay)
    setHasToday(Object.keys(loaderData.groupedData).includes(today))
    if (!hasScrolledToBottom) {
      scrollToBottom()
      setHasScrolledToBottom(true)
    }
  }, [loaderData, dayCount])

  const handleShowPreviousDays = (): void => {
    setDayCount(dayCount + 5)
  }
  function extractCommentsByDate (groupedData: GroupedDataEntry): Record<string, Comment[]> {
    const commentsByDate: Record<string, Comment[]> = {}
    Object.entries(groupedData).forEach(([date, { comments }]) => {
      commentsByDate[date] = comments as unknown as Comment[]
    })
    return commentsByDate
  }
  const [refreshChat, setRefreshChat] = useState(false)
  useEffect(() => {
    if (refreshChat) {
      scrollToBottom()
      setRefreshChat(false)
    }
  }, [refreshChat])

  return (
    <ChatContextProvider challengeId={Number(challenge.id)} cohortId={Number(membership?.cohortId ?? 0)} commentsByDate={extractCommentsByDate(groupedData)} onChange={() => { setRefreshChat(true) }}>
      <div className='max-w-2xl mt-32 md:mt-28'>
      <HideFeedbackButton />
      {hasEarlierDays && <div className='text-center text-sm text-gray-500 mb-8 cursor-pointer' onClick={handleShowPreviousDays}>show previous days</div>}
      {limitedGroupedData && Object.entries(limitedGroupedData)?.map(([date, { posts, checkIns }], index) => (

        <div
          key={date}
          ref={el => {
            postRefs.current[date] = el
            if (featuredPostId && posts.some((post) => post.id === featuredPostId)) {
              postRefs.current[featuredPostId] = el
            }
          }}
        >
          <CheckinsList
            id={`checkins-${index}`}
            date={date}
            posts={posts as Post[]}
            checkIns={[...checkIns.empty, ...checkIns.nonEmpty] as CheckIn[]}
            allowComments={true}
            highlightedObject={highlightedObject}
            highlightedId={highlightedId}
          />
        </div>
      ))}
      {/* this is an additional block for today's date if it doesn't exist in the groupedData */}
      {!hasToday && (
        <DateDivider date={today} />
      )}
      {newCheckIns.map((checkIn, index) => (
        <div key={`checkin-${checkIn.id}`}className='mb-2 bg-yellow bg-opacity-10 rounded-md'>
          <CheckinRow checkIn={checkIn} comments={[]} allowComments={true} afterDelete={handleDeleteNewCheckIn}/>
        </div>
      ))}

      {showCheckinPopup && (
        <DialogCheckin challenge={challenge} open={true} onClose={() => { setShowCheckinPopup(false) }} afterCheckIn={() => { setHasCheckedInToday(true) }} />
      )}
      {currentUser && (
        <div className='fixed w-screen md:max-w-2xl pr-2 bottom-0 pb-2 bg-white bg-opacity-90 max-h-3/4' >
          {/* back button for mobile */}
          <MobileBackButton to={`/challenges/v/${challenge.id}`} />

          <FormChat
            prompt="Type here..."
            objectId={challenge.id}
            type={'challenge'}
            autoFocus={!highlightedObject && !showfeaturedPost}
            inputRef={chatFormRef}
          />
        </div>
      )}
      {featuredPost && (
        <DialogPost post={featuredPost as Post} open={showfeaturedPost} onClose={handleClosefeaturedPost} >
          {started && !hasCheckedInToday && !expired && challenge.status !== 'DRAFT' &&
            <div className='flex items-center justify-center mt-4'>
              <CheckInButton challenge={challenge} afterCheckIn={() => { setHasCheckedInToday(true) }} />
            </div>
          }
        </DialogPost>
      )}

      {/* this is a spacer at the bottom that the app scrolls to on load */}
      <div ref={bottomRef} className={`min-h-[${hasCheckedInToday ? '50px' : '100px'}]`}>

        </div>
      </div>
    </ChatContextProvider>
  )
}
