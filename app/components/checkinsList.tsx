import { userLocale, textToJSX } from '~/utils/helpers'
import { isToday } from 'date-fns'
import { useContext, useState } from 'react'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { Lightbox } from 'react-modal-image'
import AvatarLoader from './avatarLoader'
import FormCheckIn from './formCheckin'
import { type CheckIn } from '~/utils/types'
import Liker from '~/components/liker'
import DialogDelete from './dialogDelete'
import axios from 'axios'
import { toast } from 'react-hot-toast'

export default function CheckinsList ({ checkIns, likes }: { checkIns: CheckIn[], likes: number[] }): JSX.Element {
  return (
    <div className='text-left text-xl text-gray-500 flex flex-col w-full'>
    {checkIns.map((checkIn: CheckIn) => (
      <CheckinRow key={checkIn.id} checkIn={checkIn} isLiked={likes.includes(checkIn.id)} />

    ))}
  </div>
  )
}

export function CheckinRow ({ checkIn, isLiked }: { checkIn: CheckIn, isLiked: boolean }): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const locale = userLocale(currentUser)
  const [showLightbox, setShowLightbox] = useState(false)
  const [checkInBody, setCheckInBody] = useState(textToJSX(checkIn.body ?? ''))
  const [checkInObj, setCheckInObj] = useState<CheckIn | null>(checkIn)
  const [deleteDialog, setDeleteDialog] = useState(false)
  // helper function that sets the date to only show the time if it's today
  let formatted
  const created = new Date(checkIn.createdAt)
  if (isToday(created)) {
    formatted = created.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric' })
  } else {
    formatted = created.toLocaleDateString(locale, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })
  }
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
  const showEditDelete = checkIn.userId === currentUser?.id
  if (!checkInObj) {
    return <></>
  }
  return (
    <>
      <div className='h-fit relative flex flex-items-center border-b w-full p-2 mb-2'>
        <div className='w-full h-full flex flex-row mb-4'>
          <div className='w-[60px] min-w-[60px] text-xs'>
            <AvatarLoader object={checkIn} /><br />
            {formatted}
          </div>
          <div className='ml-2 w-full pl-2'>
          {showEditForm
            ? <FormCheckIn checkIn={checkInObj} challengeId={checkInObj.challengeId} onCancel={() => { setShowEditForm(false) }} saveLabel='Save' afterCheckIn={resetOnSave}/>
            : (

            <>
            {checkInBody}
            {checkInObj.imageMeta?.secure_url &&
              <img src={checkInObj.imageMeta.secure_url} alt='checkin picture' className='mt-4 cursor-pointer max-w-[400px]' onClick={handlePhotoClick}/>}
            {showLightbox && <Lightbox medium={checkInObj.imageMeta?.secure_url} large={checkInObj.imageMeta?.secure_url} alt='checkin photo' onClose={() => { setShowLightbox(false) }}/>}
            {checkInObj.videoMeta?.secure_url && <video className={`${checkInObj.imageMeta?.secure_url ? 'mt-6' : ''} max-w-[400px]`} src={checkInObj.videoMeta.secure_url} onClick={(event) => { event?.stopPropagation() }} controls />}
            <div className='mt-2'>
              <Liker isLiked={isLiked} itemId={checkInObj.id} itemType='checkIn' count={checkInObj.likeCount} />
            </div>
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
