import { userLocale } from '~/utils/helpers'
import { HiDotsHorizontal } from 'react-icons/hi'
import { Spinner } from '@material-tailwind/react'
import { useContext, useState, useRef, useEffect } from 'react'
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
import ChatDrawer from '~/components/chatDrawer'

export default function CheckinsList ({ checkIns, likes, comments, allowComments }: { checkIns: CheckIn[], likes: number[], comments: Record<number, Comment[]>, allowComments: boolean }): JSX.Element {
  const [checkInsArr, setCheckInsArr] = useState(checkIns)
  const handleDelete = (deletedCheckIn: CheckIn): void => {
    setCheckInsArr(checkInsArr.filter(checkIn => checkIn.id !== deletedCheckIn.id))
  }

  // Group check-ins by day
  const checkInsByDay = checkInsArr.reduce<Record<string, CheckIn[]>>((acc, checkIn) => {
    const date = new Date(checkIn.createdAt).toLocaleDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(checkIn)
    return acc
  }, {})

  return (
    <div className='text-left flex flex-col w-full'>
      {Object.entries(checkInsByDay).map(([date, checkIns]) => {
        // Filter out empty check-ins and count unique users for the day
        const emptyCheckIns = checkIns.filter(checkIn => !checkIn.body?.length)
        const uniqueUsers = new Set(emptyCheckIns.map(checkIn => checkIn.userId)).size

        return (
          <div key={date}>
            <div className='border-t border-teal flex items-center justify-center'>
              <div className="text-center p-1 -mt-3.5 rounded-md drop-shadow-xl w-[90px] bg-teal text-xs text-white">{date}</div>
            </div>
            {uniqueUsers > 0 && <CollapsedCheckins count={uniqueUsers} />}
            {checkIns.map((checkIn: CheckIn, index: number) => {
              if (!checkIn.body?.length) return null // Skip empty check-ins

              return (
                <div key={checkIn.id} className={`relative pt-2 ${index === 0 ? '' : 'border-t'}`}>
                  <div className='mt-2'>
                    <CheckinRow checkIn={checkIn} isLiked={likes.includes(checkIn.id)} comments={comments[checkIn.id]} allowComments={allowComments} onDelete={handleDelete}/>
                  </div>
                </div>
              )
            })}
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
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (event: any): Promise<void> => {
    setDeleting(true)
    event.preventDefault()
    event.stopPropagation()
    try {
      await axios.delete(`/api/checkins/delete/${checkInObj.id}`)
      toast.success('Check-in deleted')
    } catch (error) {
      toast.error('Error deleting check-in')
    } finally {
      setDeleting(false)
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
  const allowEdit = props.checkIn.userId === currentUser?.id
  if (deleted) {
    return <></>
  }
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    setMenuOpen(!menuOpen)
  }
  const menuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuRef])
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

                <CheckInContent checkIn={checkInObj} timestamp={formatted}/>
                {(allowComments || comments.length > 0) &&
                  <>
                  <div className='mt-2 flex items-start ml-14 relative w-[180px]'>
                    {/* only allow comments if there is a note on the checkin */}
                    {checkInObj.body?.length || checkInObj.imageMeta?.secure_url || checkInObj.videoMeta?.secure_url &&
                      <span className="text-xs mr-4 cursor-pointer" onClick={handleComments}>
                        <FaRegComment className="text-grey h-4 w-4 mr-2 inline" />
                        {checkInObj.commentCount} comments
                      </span>
                    }
                    <Liker isLiked={isLiked} itemId={checkInObj.id} itemType='checkIn' count={checkInObj.likeCount} />
                    {allowEdit && !showEditForm &&
                      // change the position of the menu based on the length of the checkin body
                      <div className={`text-xs text-gray-500 w-sm flex absolute -top-1 ${checkInObj.body?.length > 0 ? 'justify-end right-4' : 'ml-8'} `}>
                          <div className="relative" ref={menuRef}>
                              <button onClick={toggleMenu} className="p-1 rounded-full hover:bg-gray-200">
                                  <HiDotsHorizontal className='h-4 w-4' />
                              </button>
                              {menuOpen && (
                                  <div className="absolute right-0 z-10 mt-2 w-20 bg-white border border-gray-200 rounded shadow-lg">
                                      <ul className='flex flex-col'>
                                          <li className="px-4 py-2 w-full text-left hover:bg-gray-100 cursor-pointer" onClick={() => { setShowEditForm(true) }}>Edit</li>
                                          <li className="px-4 py-2 w-full text-left hover:bg-gray-100 cursor-pointer" onClick={() => { setDeleteDialog(true) }}>
                                              {deleting ? <Spinner className='h-4 w-4' /> : 'Delete'}
                                          </li>
                                      </ul>
                                  </div>
                              )}
                          </div>
                          {deleteDialog &&
                            <DialogDelete prompt='Are you sure you want to delete this check-in?' isOpen={deleteDialog} deleteCallback={handleDelete} onCancel={() => { setDeleteDialog(false) }}/>
                          }
                      </div>
                    }
                    </div>
                    <ChatDrawer
                      isOpen={showComments}
                      placement='right'
                      onClose={hideComments}
                      comments={comments}
                      size={500}
                      checkInId={checkInObj.id}
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
        <div className='ml-1'>
          <div className='text-xs mb-2'>
            <span className='font-bold'>{checkIn.user?.profile?.firstName} {checkIn.user?.profile?.lastName}</span> <span className='text-xs'>{timestamp}</span>
          </div>
          {checkIn.body?.length > 0
            ? checkIn.body
            : <span className='text-sm italic'>Checked in</span>
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
interface CollapsedCheckinsProps {
  count: number
}

const CollapsedCheckins = ({ count }: CollapsedCheckinsProps): JSX.Element => {
  return (
    <div className='text-center p-2 bg-gray-100 rounded-md mb-4'>
      <span className='text-sm text-gray-700'>{count} members checked in</span>
    </div>
  )
}
