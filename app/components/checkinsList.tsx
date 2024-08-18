import { userLocale, textToJSX } from '~/utils/helpers'
import { isToday, formatDistanceToNow } from 'date-fns'
import { useContext, useState } from 'react'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { Lightbox } from 'react-modal-image'
import AvatarLoader from './avatarLoader'
import FormCheckIn from './formCheckin'
import type { CheckIn, Comment } from '~/utils/types'
import Liker from '~/components/liker'
import DialogDelete from './dialogDelete'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { FaRegComment } from 'react-icons/fa'
import CommentDrawer from '~/components/commentDrawer'
export default function CheckinsList ({ checkIns, likes, comments, allowComments }: { checkIns: CheckIn[], likes: number[], comments: Record<number, Comment[]>, allowComments: boolean }): JSX.Element {
  const [checkInsArr, setCheckInsArr] = useState(checkIns)
  const handleDelete = (deletedCheckIn: CheckIn): void => {
    setCheckInsArr(checkInsArr.filter(checkIn => checkIn.id !== deletedCheckIn.id))
  }
  let previousDate: string | null = null

  return (
    <div className='text-left flex flex-col w-full'>
    {checkInsArr.map((checkIn: CheckIn) => {
      const currentDate = new Date(checkIn.createdAt).toLocaleDateString()
      const isNewDay = previousDate !== currentDate
      previousDate = currentDate

      return (
        <div key={checkIn.id} className={`relative ${!isNewDay ? 'border-t pt-2' : ''}`}>
          {isNewDay &&
            <div className='border-t border-teal flex items-center justify-center'>
              <div className="text-center p-1 -mt-3.5 rounded-md drop-shadow-xl w-[90px] bg-teal text-xs text-white">{currentDate}</div>
            </div>
          }
          <div className={`${isNewDay ? 'mt-2' : ''}`}>
            <CheckinRow checkIn={checkIn} isLiked={likes.includes(checkIn.id)} comments={comments[checkIn.id]} allowComments={allowComments} onDelete={handleDelete}/>
          </div>
        </div>
      )
    })}
  </div>
  )
}

interface CheckinRowProps {
  checkIn: CheckIn
  isLiked: boolean
  comments: Comment[]
  allowComments: boolean
  onDelete: (checkIn: CheckIn) => void
}
export function CheckinRow (props: CheckinRowProps): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const locale = userLocale(currentUser)
  const { allowComments, isLiked, onDelete } = props
  const [checkInObj, setCheckInObj] = useState<CheckIn>(props.checkIn)
  const [deleted, setDeleted] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [firstComment, setFirstComment] = useState<Comment | null>(null)
  const [comments, setComments] = useState<Comment[]>(props.comments ?? [])
  const created = new Date(props.checkIn.createdAt)
  const formatted = created.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric' })
  const resetOnSave = (checkIn: CheckIn): void => {
    setCheckInObj(checkIn)
    setShowEditForm(false)
  }
  const [showEditForm, setShowEditForm] = useState(false)

  const handleDelete = async (event: any): Promise<void> => {
    event.preventDefault()
    event.stopPropagation()
    try {
      await axios.delete(`/api/checkins/delete/${checkInObj.id}`)
      toast.success('Check-in deleted')
    } catch (error) {
      toast.error('Error deleting check-in')
    } finally {
      setDeleteDialog(false)
      if (onDelete) {
        onDelete(checkInObj)
      }
      setDeleted(true)
    }
  }
  const hideComments = (): void => {
    setShowComments(false)
    setFirstComment(null)
  }
  const handleComments = (): void => {
    setShowComments(true)
  }
  const saveFirstComment = (comment: Comment): void => {
    if (firstComment) {
      // push the comment to the top of the list
      const newComments = [firstComment].concat(comments)
      setComments(newComments)
    }
    setFirstComment(comment)
    setShowCommentForm(false)
  }
  const allowEdit = props.checkIn.userId === currentUser?.id
  if (deleted) {
    return <></>
  }
  return (
    <>
      <div className='h-fit relative flex flex-items-center w-full p-2 mb-2'>
        <div className='w-full h-full flex flex-row mb-4'>
          <div className='ml-0'>
            {showEditForm
              ? <div className='w-full h-full flex flex-row mb-4'>
                  <CheckInAvatar checkIn={checkInObj} />
                  <FormCheckIn checkIn={checkInObj} challengeId={checkInObj.challengeId} onCancel={() => { setShowEditForm(false) }} saveLabel='Save' afterCheckIn={resetOnSave}/>
                </div>
              : (

                <>
                {allowEdit && !showEditForm &&
                  <div className='text-xs absolute right-16 top-0 underline text-right text-red my-2'>
                    <span className=' mr-2 cursor-pointer' onClick={() => { setShowEditForm(true) }}>edit</span>
                    <span className='cursor-pointer' onClick={() => { setDeleteDialog(true) }}>delete</span>
                    {deleteDialog &&
                      <DialogDelete prompt='Are you sure you want to delete this note?' isOpen={deleteDialog} deleteCallback={handleDelete} onCancel={() => { setDeleteDialog(false) }}/>
                    }
                  </div>
                }
                <CheckInContent checkIn={checkInObj} timestamp={formatted}/>
                {(allowComments || comments.length > 0) &&
                  <>
                  <div className='mt-2 flex items-start ml-12'>
                    <span className="text-xs mr-4 cursor-pointer" onClick={handleComments}>
                      <FaRegComment className="text-grey h-4 w-4 mr-2 inline" />
                      {checkInObj.commentCount} comments
                    </span>
                    <Liker isLiked={isLiked} itemId={checkInObj.id} itemType='checkIn' count={checkInObj.likeCount} />

                    </div>
                    <CommentDrawer
                      isOpen={showComments}
                      placement='right'
                      onClose={hideComments}
                      comments={comments}
                      size={500}
                      checkInId={checkInObj.id}
                    >
                      <CheckInContent checkIn={checkInObj} timestamp={formatted} />
                    </CommentDrawer>
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
const CheckInContent = ({ checkIn, timestamp }: CheckInProps): JSX.Element => {
  const [showLightbox, setShowLightbox] = useState(false)
  const handlePhotoClick = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    setShowLightbox(true)
  }
  return (
    <div className='w-full'>
      <div className='w-full h-full flex flex-row mb-4'>
        <CheckInAvatar checkIn={checkIn} />
        <div className='ml-0'>
          <div className='text-xs mb-2'>
            <span className='font-bold'>{checkIn.user?.profile?.firstName} {checkIn.user?.profile?.lastName}</span> <span className='text-xs'>{timestamp}</span>
          </div>
          {checkIn.body ??
            <span className='text-sm italic'>Checked in</span>
          }
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
}

const CheckInAvatar = ({ checkIn }: CheckInAvatarProps): JSX.Element => {
  return (
    <div className='w-[50px] min-w-[50px] text-xs'>
      <AvatarLoader object={checkIn} /><br />
    </div>
  )
}
