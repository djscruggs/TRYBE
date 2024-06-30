import React, { useContext, useState, useEffect } from 'react'
import {
  Card,
  Spinner
} from '@material-tailwind/react'
import CardChallenge from './cardChallenge'
import AvatarLoader from './avatarLoader'
import CardPost from './cardPost'
import type { Note } from '../utils/types'
// import { AiOutlineRetweet } from 'react-icons/ai'
// import { GoComment } from 'react-icons/go'
import { FaRegComment } from 'react-icons/fa'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import { Link, useNavigate, useLocation } from '@remix-run/react'
import { Lightbox } from 'react-modal-image'
import { toast } from 'react-hot-toast'
import FormNote from './formNote'
import axios from 'axios'
import { useRevalidator } from 'react-router-dom'
import ShareMenu from './shareMenu'
import { textToJSX, separateTextAndLinks, formatLinks } from '~/utils/helpers'
import Liker from './liker'
import DialogDelete from './dialogDelete'

interface CardNoteProps {
  note: Note
  isThread?: boolean
  isReplyTo?: boolean
  hasLiked?: boolean
}

export default function CardNote (props: CardNoteProps): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const { isReplyTo, hasLiked, isThread } = props
  const [note, setNote] = useState(props.note)
  // updating note wasn't trigering re-render, so added a noteBody attribute
  const [noteBody, setNoteBody] = useState(textToJSX(note.body ?? ''))
  const [showLightbox, setShowLightbox] = useState(false)
  const [editing, setEditing] = useState(false)
  const location = useLocation()
  const isOwnRoute = isReplyTo ?? location.pathname === `/notes/${note.id}`
  const [addReply, setAddReply] = useState(false)
  const revalidator = useRevalidator()
  const navigate = useNavigate()
  const [deleteDialog, setDeleteDialog] = useState(false)
  // I need a
  const goToNote = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    if (isOwnRoute) return
    navigate(`/notes/${note.id}`)
  }
  const isQuote = location.pathname === `/notes/${note.id}/quote`
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
    axios.delete(`/api/notes/delete/${note.id}`)
      .then(() => {
        toast.success('Note deleted')
        revalidator.revalidate()
        navigate('/home')
      })
      .catch(error => {
        toast.error('Error deleting note')
        console.error('Error deleting note:', error)
      })
  }
  const afterSave = (note: Note): void => {
    setEditing(false)
    setAddReply(false)
    setNote(note)
    // updating note wasn't trigering re-render, so added a noteBody attribute
    setNoteBody(textToJSX(note.body ?? ''))
  }
  const getFullUrl = (): string => {
    return `${window.location.origin}/notes/${note.id}`
  }
  return (
    <>
    {note.replyTo && !note.isShare &&
      <div className='mb-6'>
        <p className='text-sm'>In reply to</p>
        <CardNote note={note.replyTo} isReplyTo={true} />
      </div>
    }
    {editing
      ? <>
      <FormNote note={note} onCancel={() => { setEditing(false) }} afterSave={afterSave} />
      {note.replyTo && note.isShare &&
          <div className='mt-6'>
            <CardNote note={note.replyTo} isReplyTo={true} />
          </div>
      }
      {note.challenge && !isThread &&
          <div className='mt-2'>
            <CardChallenge challenge={note.challenge} isShare={true}/>
          </div>
        }
      </>
      : <div className={'mt-2 w-full border-0  drop-shadow-none mr-2'}>
      <div className='drop-shadow-none'>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className={'md:col-span-2 p-2 border-1 drop-shadow-lg  border border-gray rounded-md'}>
            <div className="flex items-start">
              <AvatarLoader object={note} marginClass='mr-4'/>
              <div className="flex flex-col w-full h-full">
                {noteBody}
                <div className='mt-4'>
                  {note.videoMeta?.secure_url && <video className="recorded" src={note.videoMeta.secure_url} onClick={(event) => { event?.stopPropagation() }} controls />}
                  {note.imageMeta?.secure_url && <img src={note.imageMeta.secure_url} alt="note picture" className="mt-4 cursor-pointer max-w-[200px]" onClick={handlePhotoClick} />}
                </div>
                {note.challenge && !isThread &&
                  <div className='mt-2'>
                    <CardChallenge challenge={note.challenge} isShare={true}/>
                  </div>
                }
                {note.post &&
                  <div className='mt-2'>
                    <CardPost post={note.post} isShare={true}/>
                  </div>
                }
                {currentUser?.id === note.userId &&
                  <div className="mt-2 text-xs text-gray-500 w-full text-right">
                      <span className='underline cursor-pointer mr-1' onClick={handleEdit}>edit</span>
                      <span className='underline cursor-pointer mr-1' onClick={handleDeleteDialog}>delete</span>
                  </div>
                }
              </div>
            </div>
            {deleteDialog && <DialogDelete prompt='Are you sure you want to delete this note?' isOpen={deleteDialog} deleteCallback={(event: any) => { handleDelete(event) }} onCancel={cancelDialog}/>}
            {note.replyTo && note.isShare &&
              <div className='mt-6 ml-10'>
                <CardNote note={note.replyTo} isReplyTo={true} />
              </div>
            }
          </Card>
        </div>
        {/* <span className="text-xs text-gray-500">2 hours ago</span> */}
      </div>

      {(currentUser && addReply) &&
      <div className='mt-2 w-full border-0  drop-shadow-none mr-2'>
        <FormNote replyToId={note.id} afterSave={afterSave} onCancel={() => { setAddReply(false) }} prompt='Add your response' />
      </div>
      }
      {/* don't show likes etc if this is a reply or a reply is being added */}
      {(!isReplyTo && !addReply && !isQuote) &&
      <>
        <hr />
        <div className="grid grid-cols-2 text-center py-2 cursor-pointer">
          {/* <div className="flex justify-center items-center">
          {!isThread &&
            <Link to={`/notes/${note.id}`}>
              <FaRegComment className="text-grey mr-1 inline" />
              <span className="text-xs">{note._count?.replies} replies</span>
            </Link>

          }
          </div> */}
          <div className="flex justify-center items-center cursor-pointer">

          {/* <div className='mr-2'><Liker isLiked={Boolean(hasLiked)} itemId={Number(note.id)} itemType='note' count={Number(note._count?.likes)}/></div> */}
          </div>
          {/* <div className="flex justify-center items-center cursor-pointer">
            <ShareMenu copyUrl={getFullUrl()} itemType='note' itemId={Number(note.id)}/>
          </div> */}
        </div>
      </>
      }
    </div>
    }
    {(note.image && showLightbox) && <Lightbox medium={note.image} large={note.image} alt="note photo" onClose={() => { setShowLightbox(false) }}/>}
    </>
  )
}
