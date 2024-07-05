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
import FormComment from '~/components/formComment'
import CommentsContainer from '~/components/commentsContainer'
export default function CheckinsList ({ checkIns, likes, comments, allowComments }: { checkIns: CheckIn[], likes: number[], comments: Record<number, Comment[]>, allowComments: boolean }): JSX.Element {
  let previousDate: string | null = null
  return (
    <div className='text-left flex flex-col w-full'>
    {checkIns.map((checkIn: CheckIn, index: number) => {
      const currentDate = new Date(checkIn.createdAt).toLocaleDateString()
      const isNewDay = previousDate !== currentDate
      previousDate = currentDate

      return (
        <>
          {isNewDay &&
          <div className="border-t border-red text-right text-xs italic pr-1">{currentDate}</div>
          }
          <div key={checkIn.id} className={`${isNewDay ? '-mt-5' : ''}`}>
            <CheckinRow checkIn={checkIn} isLiked={likes.includes(checkIn.id)} comments={comments[checkIn.id]} allowComments={allowComments}/>
          </div>
        </>
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
}
export function CheckinRow (props: CheckinRowProps): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const locale = userLocale(currentUser)
  const { allowComments, isLiked } = props
  const [showLightbox, setShowLightbox] = useState(false)
  const [checkInBody, setCheckInBody] = useState(textToJSX(props.checkIn.body ?? ''))
  const [checkInObj, setCheckInObj] = useState<CheckIn | null>(props.checkIn)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [showComments, setShowComments] = useState(props.comments !== undefined)
  const [firstComment, setFirstComment] = useState<Comment | null>(null)
  const [comments, setComments] = useState<Comment[]>(props.comments ?? [])
  // helper function that sets the date to only show the time if it's today
  let formatted
  const created = new Date(props.checkIn.createdAt)
  // if (isToday(created)) {
  //   formatted = created.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric' })
  // } else {
  //   formatted = created.toLocaleDateString(locale, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })
  // }
  formatted = created.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric' })
  const resetOnSave = (data: { checkIn: CheckIn }): void => {
    setCheckInBody(textToJSX(data.checkIn.body ?? ''))
    setCheckInObj(data.checkIn)
    setShowEditForm(false)
  }
  const [showEditForm, setShowEditForm] = useState(false)

  const handlePhotoClick = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    setShowLightbox(true)
  }

  const handleDelete = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    axios.delete(`/api/checkins/delete/${checkInObj.id}`)
      .then(() => {
        toast.success('Check-in deleted')
      })
      .catch(error => {
        toast.error('Error deleting check-in')
        console.error('Error deleting check-in:', error)
      }).finally(() => {
        setDeleteDialog(false)
        setCheckInObj(null)
      })
  }
  const handleComments = (): void => {
    setShowCommentForm(true)
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
  const showEditDelete = props.checkIn.userId === currentUser?.id
  if (!checkInObj) {
    return <></>
  }
  return (
    <>
      <div className='h-fit relative flex flex-items-center w-full p-2 mb-2'>
        <div className='w-full h-full flex flex-row mb-4'>
          <div className='w-[50px] min-w-[50px] text-xs'>
            <AvatarLoader object={checkInObj} /><br />

          </div>
          <div className='ml-0 w-full'>
          {showEditForm
            ? <FormCheckIn checkIn={checkInObj} challengeId={checkInObj.challengeId} onCancel={() => { setShowEditForm(false) }} saveLabel='Save' afterCheckIn={resetOnSave}/>
            : (

            <>
              <div className='text-xs mb-2'>
                <span className='font-bold'>{checkInObj.user?.profile?.firstName} {checkInObj.user?.profile?.lastName}</span> <span className='text-xs'>{formatted}</span>
              </div>

            {checkInBody ?? <span className='text-sm italic'>Checked in</span>}

            {checkInObj.imageMeta?.secure_url &&
              <img src={checkInObj.imageMeta.secure_url} alt='checkin picture' className='mt-4 cursor-pointer max-w-[400px]' onClick={handlePhotoClick}/>}
            {showLightbox && <Lightbox medium={checkInObj.imageMeta?.secure_url} large={checkInObj.imageMeta?.secure_url} alt='checkin photo' onClose={() => { setShowLightbox(false) }}/>}
            {checkInObj.videoMeta?.secure_url && <video className={`${checkInObj.imageMeta?.secure_url ? 'mt-6' : ''} max-w-[400px]`} src={checkInObj.videoMeta.secure_url} onClick={(event) => { event?.stopPropagation() }} controls />}
            {/* {(checkInBody ?? checkInObj.imageMeta?.secure_url ?? checkInObj.videoMeta?.secure_url) && */}
            {(allowComments || comments.length > 0) &&
              <>
              <div className='mt-2 flex items-start'>
                <span className="text-xs mr-4 cursor-pointer" onClick={handleComments}>
                  <FaRegComment className="text-grey h-4 w-4 mr-2 inline" />
                  {checkInObj.commentCount} comments
                </span>
                <Liker isLiked={isLiked} itemId={checkInObj.id} itemType='checkIn' count={checkInObj.likeCount} />

              </div>
              {showCommentForm &&
                <div className='text-sm'>
                  <FormComment afterSave={saveFirstComment} onCancel={() => { setShowCommentForm(false) }} checkInId={checkInObj.id} />
                </div>
              }
              {(firstComment ?? showComments) &&
                <CommentsContainer firstComment={firstComment} comments={comments} isReply={false} likedCommentIds={[]}/>
              }
              </>
            }
            </>
              )}
          </div>
        </div>
        {showEditDelete && !showEditForm &&
        // add extra margin at top if there's an image above it
          <div className='text-xs absolute right-4 bottom-0 underline text-right text-red my-2'>
            <span className=' mr-2 cursor-pointer' onClick={() => { setShowEditForm(true) }}>edit</span>
            <span className='cursor-pointer' onClick={() => { setDeleteDialog(true) }}>delete</span>
            {deleteDialog && <DialogDelete prompt='Are you sure you want to delete this note?' isOpen={deleteDialog} deleteCallback={(event: any) => { handleDelete(event) }} onCancel={() => { setDeleteDialog(false) }}/>}
          </div>
        }

      </div>
    </>
  )
}
