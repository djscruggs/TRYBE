import { userLocale, textToJSX, pluralize } from '~/utils/helpers'
import { Tooltip } from '@material-tailwind/react'
import { useContext, useState, useEffect } from 'react'
import { CurrentUserContext } from '~/contexts/CurrentUserContext'
import { Lightbox } from 'react-modal-image'
import AvatarLoader from './avatarLoader'
import FormCheckIn from './formCheckin'
import { useNavigate } from 'react-router-dom'
import type { CheckIn, Comment, Post, Profile } from '~/utils/types'
import Liker from '~/components/liker'
import ActionsPopupMenu from './actionsPopupMenu'
import CommentsIconWithCount from '~/components/commentsIcon'
import ChatDrawer from '~/components/chatDrawer'
import DateDivider from '~/components/dateDivider'
import CardPost from './cardPost'
import ChatContainer from './chatContainer'
import { useChatContext } from '~/contexts/ChatContext'
// Import the hook

interface CheckinsListProps {
  date: string
  checkIns?: CheckIn[]
  posts?: Post[]
  allowComments: boolean
  id?: string
  highlightedObject?: string | null
  highlightedId?: number | null
}

export default function CheckinsList (props: CheckinsListProps): JSX.Element {
  const { checkIns = [], posts = [], allowComments, id, highlightedObject, highlightedId } = props
  const [checkInsArr, setCheckInsArr] = useState(checkIns ?? [])
  const handleDelete = (deletedCheckIn: CheckIn): void => {
    setCheckInsArr(checkInsArr.filter(checkIn => checkIn.id !== deletedCheckIn.id))
  }

  const { getCommentsByDate } = useChatContext()
  const comments = getCommentsByDate()[props.date] ?? []

  const emptyCheckIns = checkIns?.filter(checkIn => !checkIn.body?.length)
  const uniqueUsers = new Set(emptyCheckIns?.map(checkIn => checkIn.userId)).size
  if (checkIns.length === 0 && posts.length === 0 && comments.length === 0) {
    return <></>
  }
  return (
        <div className='text-left flex flex-col w-full' id={id ?? 'checkins-list'}>
          <div key={props.date}>
            <DateDivider date={props.date} />
            {uniqueUsers > 0 && <CollapsedCheckins checkIns={emptyCheckIns} />}
            {checkIns.map((checkIn: CheckIn) => {
              if (!checkIn.body?.length) return null // Skip empty check-ins

              return (
                <CheckinRow key={checkIn.id} checkIn={checkIn} comments={[]} allowComments={allowComments} highlightedObject={highlightedObject} highlightedId={highlightedId} afterDelete={handleDelete} />

              )
            })}
            {posts.map((post: Post) => (
              <div key={`post-${post.id}`} className='max-w-sm md:max-w-xl mb-6 bg-yellow bg-opacity-20 rounded-lg p-2 px-4' id={`post-${post.id}`}>
                <CardPost post={post} hideMeta={false} fullPost={false} isChat={true} highlightedObject={highlightedObject} highlightedId={highlightedId} />
              </div>
            ))}
            {comments &&
              <>
                <ChatContainer
                  key={`comments-${props.date}`}
                  date={props.date}
                  allowReplies={true}
                  highlightedObject={highlightedObject as string | undefined}
                  highlightedId={highlightedId as number | undefined}
                />
              </>
            }
          </div>
        </div>
  )
}

interface CheckinRowProps {
  checkIn: CheckIn
  comments?: Comment[]
  allowComments: boolean
  afterDelete: (deletedCheckIn: CheckIn) => void
  highlightedObject?: string | null
  highlightedId?: number | null
}
export function CheckinRow (props: CheckinRowProps): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const locale = userLocale(currentUser)
  const { allowComments, comments, checkIn } = props
  const [checkInObj, setCheckInObj] = useState<CheckIn>(checkIn)
  const [deleted, setDeleted] = useState(false)
  const [showComments, setShowComments] = useState(Boolean(props?.highlightedObject === 'checkin' && props?.highlightedId === checkInObj.id))
  const onClose = (): void => {
    setShowComments(false)
  }
  const created = new Date(props.checkIn.createdAt)
  const formatted = created.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric' })
  const resetOnSave = (checkIn: CheckIn): void => {
    setCheckInObj(checkIn)
    setShowEditForm(false)
  }
  const handleDelete = (object: CheckIn): void => {
    setDeleted(true)
    props.afterDelete(object)
  }
  const [showEditForm, setShowEditForm] = useState(false)
  /* only allow comments if there is a note or imagehighlightedObject or videoon the checkin */
  const acceptComments = checkInObj.body?.length || checkInObj.imageMeta?.secure_url || checkInObj.videoMeta?.secure_url
  if (deleted) {
    return <></>
  }

  return (
    <>
      <div className='h-fit relative flex flex-items-center w-full p-2 pb-0  hover:bg-gray-100'>
        <div className='w-full h-full flex flex-row mb-2'>
          <div className='ml-0'>
            {showEditForm
              ? <div className='w-full h-full flex flex-row mb-4'>
                  <CheckInAvatar checkIn={checkInObj} />
                  <FormCheckIn checkIn={checkInObj} challengeId={checkInObj.challengeId} onCancel={() => { setShowEditForm(false) }} saveLabel='Save' afterCheckIn={resetOnSave}/>
                </div>
              : (
                <>
                <CheckInContent checkIn={checkInObj} timestamp={formatted}/>
                {(allowComments || (comments?.length ?? 0) > 0) &&
                  <>
                  <div className='flex items-start ml-12 mt-2 relative'>
                    {acceptComments &&
                      <CommentsIconWithCount
                        object={checkInObj}
                        showCallback={setShowComments}
                      />
                    }
                    <Liker
                      itemId={checkInObj.id}
                      itemType='checkin'
                      count={checkInObj.likeCount}
                    />
                    {!showEditForm &&
                      <ActionsPopupMenu
                        object={checkInObj}
                        type='checkin'
                        editCallback={() => { setShowEditForm(true) }}
                        afterDelete={handleDelete}
                      />
                      // change the position of the menu based on the length of the checkin body

                    }
                  </div>
                  <ChatDrawer
                    isOpen={showComments}
                    placement='right'
                    onClose={onClose}
                    comments={comments}
                    size={500}
                    id={checkInObj.id}
                    type='checkin'
                    commentCount={checkInObj.commentCount}
                  >
                    <CheckInContent checkIn={checkInObj} timestamp={formatted} />
                  </ChatDrawer>
                  </>
                }
                </>
                )
            }
          </div>
        </div>

      </div>
    </>
  )
}
interface CheckInProps {
  checkIn: CheckIn
  timestamp: string
}
export const CheckInContent = ({ checkIn, timestamp }: CheckInProps): JSX.Element => {
  const [showLightbox, setShowLightbox] = useState(false)
  const handlePhotoClick = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    setShowLightbox(true)
  }
  return (
    <div className='w-full'>
      <div className='w-full h-full flex flex-row'>
        <CheckInAvatar checkIn={checkIn} />
        <div className='ml-0'>
          <div className='text-xs mb-2'>
            <span className='font-bold'>{checkIn.user?.profile?.fullName}</span>
            { timestamp && <span className='text-xs'> checked in {timestamp === 'just now' ? 'just now' : `at ${timestamp}`}</span>}

          </div>
          <div className='mb-2'>
            {checkIn.body?.length > 0
              ? textToJSX(checkIn.body)
              : <span className='text-sm italic'>Checked in</span>
            }
          </div>
          {checkIn.imageMeta?.secure_url &&
            <img src={checkIn.imageMeta.secure_url} alt='checkin picture' className='mt-4 cursor-pointer max-h-[200px]' onClick={handlePhotoClick}/>
          }
          {showLightbox &&
            <Lightbox medium={checkIn.imageMeta?.secure_url} large={checkIn.imageMeta?.secure_url} alt='checkin photo' onClose={() => { setShowLightbox(false) }}/>
          }
          {checkIn.videoMeta?.secure_url &&
            <video className={`${checkIn.imageMeta?.secure_url ? 'mt-6' : ''} max-w-[400px]`} src={checkIn.videoMeta.secure_url} onClick={(event) => { event?.stopPropagation() }} controls />
          }
        </div>
      </div>

    </div>
  )
}
interface CheckInAvatarProps {
  checkIn: CheckIn
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  shape?: 'circle' | 'square'
}
const CheckInAvatar = ({ checkIn, size = 'sm', shape = 'circle' }: CheckInAvatarProps): JSX.Element => {
  return (
    <div className='mr-2 min-w-10'>
      <AvatarLoader object={checkIn} clickable={true} size={size} shape={shape}/>
    </div>
  )
}
interface CollapsedCheckinsProps {
  checkIns: CheckIn[]
}

const CollapsedCheckins = ({ checkIns }: CollapsedCheckinsProps): JSX.Element => {
  if (checkIns.length === 0) {
    return <></>
  }
  const baseProfiles = Array.from(new Map(checkIns.map(checkIn => [checkIn.user?.profile?.id, checkIn.user?.profile])).values()).filter(profile => profile !== undefined)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const testProfiles = Array(12).fill(baseProfiles).flat().map((profile, index) => ({
    ...profile,
    id: `${profile.id}-${index}`
  }))
  const uniqueProfiles = baseProfiles
  const count = uniqueProfiles.length
  return (
    <div className='p-2 bg-gray-100 rounded-md mb-4 text-xs'>
      {count === 1
        ? (
          <div className='flex items-center'>
            <CheckInAvatar checkIn={checkIns[0]} />
            <span className='ml-2'>{uniqueProfiles[0]?.fullName} checked in
              {checkIns.length > 1 ? checkIns.length === 2 ? ' twice' : ` ${checkIns.length} times` : ''}
            </span>
          </div>
          )
        : count === 2
          ? `${uniqueProfiles.slice(0, 2).map(profile => `${profile?.fullName}`).join(' and ')} checked in`
          : `${uniqueProfiles.slice(0, 2).map(profile => `${profile?.fullName}`).join(', ')} and ${count - 2} ${pluralize(count - 2, 'other', 'others')} checked in`
      }
      {count > 1 &&
        <StackedAvaters profiles={uniqueProfiles as Profile[]} />
      }
    </div>
  )
}

const StackedAvaters = ({ profiles }: { profiles: Profile[] }): JSX.Element => {
  const maxProfiles = 5
  const navigate = useNavigate()
  const handleProfileClick = (profile: Profile): void => {
    navigate(`/members/${profile.userId}/content`)
  }
  return (
    <div className="flex items-center -space-x-4 h-12">
      {profiles.slice(0, maxProfiles).map((profile) => (
        profile?.profileImage && (
          <div key={profile.id}>
            <Tooltip content={profile.fullName} className='text-xs'>
              <img
                key={profile.id}
                alt={profile.fullName ?? ''}
                src={profile.profileImage}
                className="relative inline-block h-8 w-8 !rounded-full border-2 border-white object-cover object-center hover:z-10 hover:h-10 hover:w-10 hover:cursor-pointer focus:z-10"
                onClick={() => { handleProfileClick(profile) }}
              />
            </Tooltip>
          </div>

        )
      ))}
    </div>
  )
}
