import React, { useContext, useState, useEffect } from 'react'
import {
  Card,
  Avatar,
  Spinner,
  Dialog
} from '@material-tailwind/react'
import CardChallenge from './cardChallenge'
import type { Post } from '../utils/types'
// import { AiOutlineRetweet } from 'react-icons/ai'
// import { GoComment } from 'react-icons/go'
import { CiChat1 } from 'react-icons/ci'
import { convertlineTextToHtml } from '~/utils/helpers'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import { Link, useNavigate, useLocation } from '@remix-run/react'
import { Lightbox } from 'react-modal-image'
import { toast } from 'react-hot-toast'
import FormPost from './formPost'
import axios from 'axios'
import { useRevalidator } from 'react-router-dom'
import ShareMenu from './shareMenu'

interface CardPostProps {
  post: Post
  hasLiked?: boolean
  fullPost?: boolean
  locale?: string // used in editing
}

export default function CardPost (props: CardPostProps): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const { post, hasLiked, fullPost, locale } = props
  const [showLightbox, setShowLightbox] = useState(false)
  const [editing, setEditing] = useState(false)
  const [videoDialog, setVideoDialog] = useState(false)
  const handleVideoDialog = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    setVideoDialog(!videoDialog)
  }

  const location = useLocation()
  const isOwnRoute = location.pathname === `/posts/${post.id}`
  const revalidator = useRevalidator()
  const navigate = useNavigate()
  const goToPost = (): void => {
    if (isOwnRoute) return
    navigate(`/posts/${post.id}`)
  }
  const isQuote = location.pathname === `/posts/${post.id}/quote`
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
  const handleDelete = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    axios.delete(`/api/posts/delete/${post.id}`)
      .then(() => {
        toast.success('Post deleted')
        revalidator.revalidate()
        navigate('/home')
      })
      .catch(error => {
        toast.error('Error deleting post')
        console.error('Error deleting post:', error)
      })
  }
  const shortBody = !fullPost && post.body?.length > 200 ? post.body.replace(/^(.{200}[^\s]*).*/, '$1') : post.body
  const afterSave = (): void => {
    revalidator.revalidate()
    console.log('state', revalidator.state)
    setEditing(false)
  }
  const getFullUrl = (): string => {
    return `${window.location.origin}/posts/${post.id}`
  }
  if (revalidator.state === 'loading') {
    return <Spinner className="h-4 w-4" />
  }
  return (
    <>
    {editing
      ? <>
      <FormPost post={post} onCancel={() => { setEditing(false) }} afterSave={afterSave} locale={locale} />

      </>
      : <div className={'mt-2 w-full border-0  drop-shadow-none mr-2'}>
      <div className={`drop-shadow-none ${!isOwnRoute ? 'cursor-pointer' : ''}`} onClick={goToPost}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className={'md:col-span-2 p-2 border-1 drop-shadow-lg  border border-gray rounded-md relative'}>
            {!post.published &&
            <>
            <div className='bg-yellow w-full p-0 text-center absolute left-0 top-0 b-4'>Draft</div>
            {/* spacer to push down the conent below */}
            <div className='h-6'> </div>
            </>
            }
            <div className="flex items-start">
              <AvatarChooser post={post}/>
              <div className="flex flex-col w-full h-full">
              <div className='font-bold my-2'>{post.title}</div>
              {convertlineTextToHtml(String(shortBody))}
              <div className='mt-4'>
              {post.video && <video className="recorded" src={post.video} onClick={(event) => { event?.stopPropagation() }} controls />}

              {post.image && <img src={`${post.image}?${Date.now()}`} alt="post picture" className="mt-4 cursor-pointer max-w-[200px]" onClick={handlePhotoClick} />}
              </div>
              {currentUser?.id === post.userId &&
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
  <hr />
      <div className="grid grid-cols-3 text-center py-2 cursor-pointer">
        <div className="flex justify-center items-center cursor-pointer">
        <span className={`text-xs ${hasLiked ? 'text-red-500' : ''}`} onClick={goToPost}>{post._count?.likes} likes</span>
        </div>
        <div className="flex justify-center items-center cursor-pointer">
          <ShareMenu copyUrl={getFullUrl()} itemType='post' itemId={post.id}/>
        </div>
      </div>

    </div>
    }
    {(post.image && showLightbox) && <Lightbox medium={post.image} large={post.image} alt="post photo" onClose={() => { setShowLightbox(false) }}/>}
    </>
  )
}

function AvatarChooser ({ post }: { post: Post }): JSX.Element {
  const [loading, setLoading] = useState(!post.user?.profile)
  const [profile, setProfile] = useState(post.user?.profile)
  useEffect(() => {
    if (!profile) {
      setLoading(true)
      axios.get(`/api/users/${post.userId}`)
        .then(res => {
          setProfile(res.data.profile)
        })
        .catch(err => {
          console.error('error', err)
        }).finally(() => {
          setLoading(false)
        })
    }
  }, [post.userId])
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
