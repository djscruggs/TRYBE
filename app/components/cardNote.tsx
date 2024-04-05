import React, { useContext, useState, useEffect } from 'react'
import {
  Card,
  Avatar
} from '@material-tailwind/react'
import type { Note } from '../utils/types.server'
import { SlShareAlt } from 'react-icons/sl'
import { AiOutlineRetweet } from 'react-icons/ai'
import { GoComment } from 'react-icons/go'
import { CiChat1 } from 'react-icons/ci'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import { Link, useNavigate, useLocation } from '@remix-run/react'
import { Lightbox } from 'react-modal-image'
import { toast } from 'react-hot-toast'
import FormNote from './form-note'
import axios from 'axios'
import { useRevalidator } from 'react-router-dom'
import { loadUser } from '../models/user.server'

interface CardNoteProps {
  note: Note
  isReplyTo?: boolean
  showReplies?: boolean
  hasLiked?: boolean
  hasReposted?: boolean
  repostCount?: number
}

export default function CardNote (props: CardNoteProps): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const { note, isReplyTo, showReplies, hasLiked, hasReposted, repostCount } = props
  const [showLightbox, setShowLightbox] = useState(false)
  const [editing, setEditing] = useState(false)
  const location = useLocation()
  const isOwnRoute = isReplyTo ?? location.pathname === `/notes/${note.id}`
  const [repostMenu, setRepostMenu] = useState(false)
  const [addReply, setAddReply] = useState(false)
  const revalidator = useRevalidator()
  const navigate = useNavigate()

  const goToNote = (): void => {
    setRepostMenu(false)
    if (isOwnRoute) return
    navigate(`/notes/${note.id}`)
  }
  const isQuote = location.pathname === `/notes/${note.id}/quote`
  const handlePhotoClick = (event: any): void => {
    setRepostMenu(false)
    event.preventDefault()
    event.stopPropagation()
    setShowLightbox(true)
  }
  const handleEdit = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    setEditing(true)
  }
  const handleDelete = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    axios.delete(`/api/notes/delete/${note.id}`)
      .then(() => {
        toast.success('Note deleted')
        revalidator.revalidate()
      })
      .catch(error => {
        toast.error('Error deleting note')
        console.error('Error deleting note:', error)
      })
  }
  const handleReply = (event: any): void => {
    setAddReply(true)
    event.preventDefault()
    event.stopPropagation()
  }
  const handleRepostMenu = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    setRepostMenu(!repostMenu)
  }
  const handleRepost = async (event: any): Promise<void> => {
    event.preventDefault()
    event.stopPropagation()
    setRepostMenu(false)
    const formData = new FormData()
    if (hasReposted) {
      formData.append('unrepost', 'true')
    }
    formData.append('replyToId', note.id?.toString())
    formData.append('isRepost', 'true')

    try {
      const result = await axios.post(`/api/notes/${note.id}/repost`, formData)
      toast.success(hasReposted ? 'Repost cleared' : 'Note reposted')
      revalidator.revalidate()
    } catch (error) {
      toast.error('Error reposting note')
      console.error(error)
    }
  }
  const handleQuote = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    setRepostMenu(false)
    navigate(`/notes/${note.id}/quote`)
  }
  const afterSave = (): void => {
    setEditing(false)
    revalidator.revalidate()
  }
  return (
    <>
    {note.replyTo &&
      <div className='mb-6'>
        <p className='text-sm'>In reply to</p>
        <CardNote note={note.replyTo} isReplyTo={true} />
      </div>
    }
    {editing
      ? <FormNote note={note} onCancel={() => { setEditing(false) }} afterSave={afterSave} />
      : <div className={'mt-2 w-full border-0  drop-shadow-none mr-2'}>
      <div className={`drop-shadow-none ${!isOwnRoute ? 'cursor-pointer' : ''}`} onClick={goToNote}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className={`md:col-span-2 p-2 border-1 drop-shadow-lg  border border-${currentUser?.id === note.userId && !isReplyTo && !isQuote ? 'green-500' : 'gray'} rounded-md`}>
            <div className="flex items-start">
              <AvatarChooser note={note}/>
              <div className="flex flex-col w-full">
              {note.body}
              {note.image && <img src={`${note.image}?${Date.now()}`} alt="note picture" className="cursor-pointer max-w-[200px]" onClick={handlePhotoClick} />}
              {currentUser && !isQuote &&
                <div className="mt-8 text-xs text-gray-500 align-self-end flex justify-between w-full">
                  <div>
                    <span className='underline cursor-pointer' onClick={handleReply}>
                      <GoComment className='inline mr-1 h-6 w-6' />
                    </span>
                    <div className='relative inline'>
                      <AiOutlineRetweet className={`cursor-pointer h-6 w-6 inline ${hasReposted ? 'text-green-500' : 'text-gray'}`} onClick={handleRepostMenu} />
                      {repostCount}
                      {repostMenu &&
                        <div className='absolute left-0 top-4 bg-white border border-gray rounded-md w-[90px]'>
                          <p className='cursor-pointer hover:bg-gray-100 p-2' onClick={handleRepost}>{hasReposted ? 'Clear repost' : 'Repost'}</p>
                          <p className='cursor-pointer hover:bg-gray-100 p-2' onClick={handleQuote}>Quote</p>
                        </div>
                      }
                    </div>
                  </div>
                {currentUser?.id === note.userId &&
                  <div className='flex justify-end'>
                    <span className='underline cursor-pointer mr-1' onClick={handleEdit}>edit</span>
                    <span className='underline cursor-pointer mr-1' onClick={handleDelete}>delete</span>
                  </div>
                }
                </div>
              }
              </div>
            </div>
          </Card>
        </div>
        {/* <span className="text-xs text-gray-500">2 hours ago</span> */}
      </div>
      {(currentUser && addReply) &&
      <div className='mt-2 w-full border-0  drop-shadow-none mr-2'>
        <FormNote replyToId={note.id} onCancel={() => { setAddReply(false) }} prompt='Add your response' />
      </div>
      }
      {/* don't show likes etc if this is a reply or a reply is being added */}
      {(!isReplyTo && !addReply && !isQuote) &&
      <>
        <hr />
        <div className="grid grid-cols-3 text-center py-2 cursor-pointer">
          <div className="flex justify-center items-center">
          <Link to={`/notes/${note.id}/comments#comments`}>
            <CiChat1 className="text-gray mr-1 inline" />
            <span className="text-xs">{note._count?.replies} replies</span>
            </Link>
          </div>
          <div className="flex justify-center items-center cursor-pointer">

          <span className={`text-xs ${hasLiked ? 'text-red-500' : ''}`} onClick={goToNote}>{note._count?.likes} likes</span>
          </div>
          <div className="flex justify-center items-center cursor-pointer">
            <SlShareAlt className="text-gray text-sm mr-1" />
            <span className="text-xs">Share</span>
          </div>
        </div>
      </>
      }
    </div>
    }
    {(note.image && showLightbox) && <Lightbox medium={note.image} large={note.image} alt="note photo" onClose={() => { setShowLightbox(false) }}/>}
    </>
  )
}

function AvatarChooser ({ note }: { note: Note }): JSX.Element {
  const [loading, setLoading] = useState(!note.user?.profile)
  const [profile, setProfile] = useState(note.user?.profile)
  useEffect(() => {
    if (!profile) {
      setLoading(true)
      axios.get(`/api/users/${note.userId}`)
        .then(res => {
          setProfile(res.data.profile)
        })
        .catch(err => {
          console.error('error', err)
        }).finally(() => {
          setLoading(false)
        })
    }
  }, [note.userId])
  if (loading) {
    return <div className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center mr-8 flex-shrink-0 flex-grow-0">

    </div>
  }

  const avatarImg = profile?.profileImage ? `${profile.profileImage}?${Date.now()}` : ''
  if (avatarImg) {
    return <Avatar src={avatarImg} className='mr-8'/>
  }

  return (
      <div className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center mr-8 flex-shrink-0 flex-grow-0">
        {loading || !profile
          ? ''
          : <span className="text-white">{`${profile.firstName[0]}${profile.lastName[0]}`}</span>
        }
      </div>
  )
}
