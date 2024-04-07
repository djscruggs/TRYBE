import React, { useContext, useState, useEffect } from 'react'
import {
  Card,
  Avatar
} from '@material-tailwind/react'
import CardChallenge from './cardChallenge'
import type { Note } from '../utils/types.server'
// import { AiOutlineRetweet } from 'react-icons/ai'
// import { GoComment } from 'react-icons/go'
import { CiChat1 } from 'react-icons/ci'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import { Link, useNavigate, useLocation } from '@remix-run/react'
import { Lightbox } from 'react-modal-image'
import { toast } from 'react-hot-toast'
import FormNote from './formNote'
import axios from 'axios'
import { useRevalidator } from 'react-router-dom'
import ShareMenu from './shareMenu'

interface CardNoteProps {
  note: Note
  isReplyTo?: boolean
  hasLiked?: boolean
  hasReposted?: boolean
  repostCount?: number
}

export default function CardNote (props: CardNoteProps): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const { note, isReplyTo, hasLiked, hasReposted, repostCount } = props
  const [showLightbox, setShowLightbox] = useState(false)
  const [editing, setEditing] = useState(false)
  const location = useLocation()
  const isOwnRoute = isReplyTo ?? location.pathname === `/notes/${note.id}`
  const [repostMenu, setRepostMenu] = useState(false)
  const [addReply, setAddReply] = useState(false)
  const revalidator = useRevalidator()
  const navigate = useNavigate()
  console.log(note)
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
  // const handleReply = (event: any): void => {
  //   setAddReply(true)
  //   event.preventDefault()
  //   event.stopPropagation()
  // }
  // const handleRepostMenu = (event: any): void => {
  //   event.preventDefault()
  //   event.stopPropagation()
  //   setRepostMenu(!repostMenu)
  // }
  // const handleRepost = async (event: any): Promise<void> => {
  //   event.preventDefault()
  //   event.stopPropagation()
  //   setRepostMenu(false)
  //   const formData = new FormData()
  //   if (hasReposted) {
  //     formData.append('unrepost', 'true')
  //   }
  //   formData.append('replyToId', note.id?.toString())
  //   formData.append('isRepost', 'true')

  //   try {
  //     const result = await axios.post(`/api/notes/${note.id}/repost`, formData)
  //     toast.success(hasReposted ? 'Repost cleared' : 'Note reposted')
  //     revalidator.revalidate()
  //   } catch (error) {
  //     toast.error('Error reposting note')
  //     console.error(error)
  //   }
  // }
  // const handleQuote = (event: any): void => {
  //   event.preventDefault()
  //   event.stopPropagation()
  //   setRepostMenu(false)
  //   navigate(`/notes/${note.id}/quote`)
  // }
  const afterSave = (): void => {
    setEditing(false)
    setAddReply(false)
    revalidator.revalidate()
  }
  const getFullUrl = (): string => {
    return `${window.location.origin}/notes/${note.id}`
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
              {note.challenge &&
                <div className='mt-2'>
                  <CardChallenge challenge={note.challenge} isShare={true}/>
                </div>
              }
              {currentUser?.id === note.userId &&
                <div className="mt-2 text-xs text-gray-500 w-full text-right">
                    <span className='underline cursor-pointer mr-1' onClick={handleEdit}>edit</span>
                    <span className='underline cursor-pointer mr-1' onClick={handleDelete}>delete</span>
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
        <FormNote replyToId={note.id} afterSave={afterSave} onCancel={() => { setAddReply(false) }} prompt='Add your response' />
      </div>
      }
      {/* don't show likes etc if this is a reply or a reply is being added */}
      {(!isReplyTo && !addReply && !isQuote) &&
      <>
        <hr />
        <div className="grid grid-cols-3 text-center py-2 cursor-pointer">
          <div className="flex justify-center items-center">
          <Link to={`/notes/${note.id}`}>
            <CiChat1 className="text-gray mr-1 inline" />
            <span className="text-xs">{note._count?.replies} replies</span>
            </Link>
          </div>
          <div className="flex justify-center items-center cursor-pointer">

          <span className={`text-xs ${hasLiked ? 'text-red-500' : ''}`} onClick={goToNote}>{note._count?.likes} likes</span>
          </div>
          <div className="flex justify-center items-center cursor-pointer">
            <ShareMenu copyUrl={getFullUrl()} itemType='note' itemId={note.id}/>

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
