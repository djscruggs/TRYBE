import { userLocale, textToJSX } from '~/utils/helpers'
import { isToday } from 'date-fns'
import { useContext, useState } from 'react'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { Lightbox } from 'react-modal-image'
import AvatarLoader from './avatarLoader'
import FormCheckIn from './formCheckin'
export default function CheckinsList ({ checkIns }: { checkIns: CheckIn[] }): JSX.Element {
  return (
    <div className='text-left text-xl text-gray-500 flex flex-col w-full'>
    {checkIns.map((checkIn: any) => (
      <CheckinRow key={checkIn.id} checkIn={checkIn} />

    ))}
  </div>
  )
}

export function CheckinRow ({ checkIn }: { checkIn: CheckIn }): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const locale = userLocale(currentUser)
  const [showLightbox, setShowLightbox] = useState(false)
  const [checkInBody, setCheckInBody] = useState(textToJSX(checkIn.body as string ?? ''))

  // helper function that sets the date to only show the time if it's today
  let formatted
  const created = new Date(checkIn.createdAt)
  if (isToday(created)) {
    formatted = created.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric' })
  } else {
    formatted = created.toLocaleDateString(locale, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })
  }

  const [showEditForm, setShowEditForm] = useState(false)

  const handlePhotoClick = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    setShowLightbox(true)
  }
  const showEditDelete = checkIn.user.id === currentUser?.id
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
            ? <FormCheckIn checkIn={checkIn} challengeId={checkIn.challengeId} onCancel={() => { setShowEditForm(false) }} saveLabel='Save' />
            : (

            <>
            {checkInBody}
            {checkIn.imageMeta &&
              <img src={checkIn.imageMeta.secure_url} alt='checkin picture' className='mt-4 cursor-pointer max-w-[400px]' onClick={handlePhotoClick}/>}
            {showLightbox && <Lightbox medium={checkIn.imageMeta.secure_url} large={checkIn.imageMeta.secure_url} alt='checkin photo' onClose={() => { setShowLightbox(false) }}/>}
            {checkIn.videoMeta?.secure_url && <video className='max-w-[400px]' src={checkIn.videoMeta.secure_url} onClick={(event) => { event?.stopPropagation() }} controls />}
            </>
              )}
          </div>

        </div>
        {showEditDelete && !showEditForm &&
          <div className='order text-xs absolute right-4 bottom-0 underline text-right text-red my-2'>
            <span className=' mr-2 cursor-pointer' onClick={() => { setShowEditForm(true) }}>edit</span>
            <span className='cursor-pointer'>delete</span>
          </div>
        }

      </div>

    </>
  )
}
