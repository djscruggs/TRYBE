import React, { useContext, useState, useEffect } from 'react'
import pkg from '@material-tailwind/react';
const { Spinner, Card } = pkg;
import AvatarLoader from './avatarLoader'
import type { ThreadSummary, Thread } from '~/utils/types'
import { FaRegComment } from 'react-icons/fa'
import { CurrentUserContext } from '~/contexts/CurrentUserContext'
import { Link, useNavigate, useLocation } from 'react-router';
import { Lightbox } from 'react-modal-image'
import { toast } from 'react-hot-toast'
import FormThread from './formThread'
import axios from 'axios'
import { useRevalidator } from 'react-router';
import ShareMenu from './shareMenu'
import { textToJSX, separateTextAndLinks, formatLinks } from '~/utils/helpers'
import Liker from './liker'
import DialogDelete from './dialogDelete'

interface CardThreadProps {
  thread: Thread | ThreadSummary
}

export default function CardThread (props: CardThreadProps): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const [thread, setThread] = useState(props.thread)
  const [showLightbox, setShowLightbox] = useState(false)
  const [editing, setEditing] = useState(false)
  const location = useLocation()
  const isOwnRoute = location.pathname === `/threads/${thread.id}`
  const revalidator = useRevalidator()
  const navigate = useNavigate()
  const [deleteDialog, setDeleteDialog] = useState(false)
  useEffect(() => {
    setThread(props.thread)
  }, [props.thread])
  const goToThread = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    if (isOwnRoute) return
    navigate(`/threads/${thread.id}`)
  }
  const handlePhotoClick = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    setShowLightbox(true)
  }
  const handleEdit = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    setEditing(true)
  }
  const handleDeleteDialog = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    setDeleteDialog(true)
  }
  const cancelDialog = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    setDeleteDialog(false)
  }
  const handleDelete = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    axios.delete(`/api/threads/delete/${thread.id}`)
      .then(() => {
        toast.success('Thread deleted')
        revalidator.revalidate()
        navigate('/challenges')
      })
      .catch(error => {
        toast.error('Error deleting thread')
        console.error('Error deleting thread:', error)
      })
  }

  const afterSave = (thread: ThreadSummary): void => {
    setThread(thread)
    setEditing(false)
  }
  const getFullUrl = (): string => {
    return `${window.location.origin}/threads/${thread.id}`
  }
  if (revalidator.state === 'loading') {
    return <Spinner className="h-4 w-4" />
  }
  return (
    <>
    {editing
      ? <FormThread thread={thread} onCancel={() => { setEditing(false) }} afterSave={afterSave} />

      : <div className={'mt-2 w-full border-0  drop-shadow-none mr-2'}>
      <div className={`drop-shadow-none ${!isOwnRoute ? 'cursor-pointer' : ''}`} onClick={goToThread}>
        <div className="w-lg">
        <Card className={'md:col-span-2 p-2 border-1 drop-shadow-lg  border border-gray rounded-md relative'}>
            <div className="flex items-start">
              <AvatarLoader object={thread} marginClass='mr-4'/>
              <div className="flex flex-col w-full h-full">
                <div className='font-bold my-2'>{thread.title}</div>

                {thread.body && textToJSX(thread.body)}
                <div className='mt-4'>
                  {thread.videoMeta?.secure_url && <video className="recorded" src={thread.videoMeta.secure_url} onClick={(event) => { event?.stopPropagation() }} controls />}
                  {thread.imageMeta?.secure_url && <img src={thread.imageMeta.secure_url} alt="thread picture" className="mt-4 cursor-pointer max-w-[200px]" onClick={handlePhotoClick} />}
                </div>
                {currentUser?.id === thread.userId &&
                  <div className="mt-2 text-xs text-gray-500 w-full text-right">
                      <span className='underline cursor-pointer mr-1' onClick={handleEdit}>edit</span>
                      <span className='underline cursor-pointer mr-1' onClick={handleDeleteDialog}>delete</span>
                  </div>
                }
              </div>
            </div>
          </Card>
            {deleteDialog && <DialogDelete prompt='Are you sure you want to delete this thread?' isOpen={deleteDialog} deleteCallback={(event: any) => { handleDelete(event) }} onCancel={cancelDialog}/>}
        </div>
        {/* <span className="text-xs text-gray-500">2 hours ago</span> */}
      </div>

      <hr />
        <div className={`grid ${isOwnRoute ? 'grid-cols-2' : 'grid-cols-3'} text-center py-2 cursor-pointer`}>

          {!isOwnRoute &&
            <div className="flex justify-center items-center">
              <Link to={`/threads/${thread.id}`}>
                <FaRegComment className="text-grey mr-1 inline" />
                <span className="text-xs">{thread.commentCount} comments</span>
              </Link>
            </div>
          }

          <div className="flex justify-center items-center cursor-pointer">
            <div className='mr-2'>
              <Liker itemId={Number(thread.id)} itemType='thread' count={Number(thread.likeCount ?? 0)}/>
            </div>
          </div>
          <div className="flex justify-center items-center cursor-pointer">
            <ShareMenu copyUrl={getFullUrl()} itemType='thread' itemId={Number(thread.id)}/>
          </div>
        </div>
      </div>
    }
    {(thread.imageMeta?.secure_url && showLightbox) && <Lightbox medium={thread.imageMeta?.secure_url} large={thread.imageMeta?.secure_url} alt="thread photo" onClose={() => { setShowLightbox(false) }}/>}

    </>
  )
}
