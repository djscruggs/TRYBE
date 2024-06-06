import React, { useContext, useState } from 'react'
import {
  Card
} from '@material-tailwind/react'
import type { Post, PostSummary } from '../utils/types'
// import { AiOutlineRetweet } from 'react-icons/ai'
// import { GoComment } from 'react-icons/go'
import { textToJSX, separateTextAndLinks, formatLinks } from '~/utils/helpers'

import { CurrentUserContext } from '../utils/CurrentUserContext'
import AvatarLoader from './avatarLoader'
import { Link, useNavigate, useLocation } from '@remix-run/react'
import { Lightbox } from 'react-modal-image'
import { toast } from 'react-hot-toast'
import FormPost from './formPost'
import axios from 'axios'
import ShareMenu from './shareMenu'
import { FaRegComment } from 'react-icons/fa'
import Liker from './liker'
import DialogDelete from './dialogDelete'
import { format } from 'date-fns'

interface CardPostProps {
  post: PostSummary
  isShare?: boolean
  hasLiked?: boolean
  fullPost?: boolean
  hideMeta?: boolean
  revalidator?: Revalidator
}
interface Revalidator {
  revalidate: () => void
}

export default function CardPost (props: CardPostProps): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const { hasLiked, fullPost, isShare, hideMeta, revalidator } = props
  const dateTimeFormat = currentUser?.dateTimeFormat ? currentUser.dateTimeFormat : 'M-dd-yyyy @ h:mm a'
  const [post, setPost] = useState(props.post)
  const [showLightbox, setShowLightbox] = useState(false)
  const [editing, setEditing] = useState(false)
  const totalLikes = post._count?.likes ?? 0
  const location = useLocation()
  const isOwnRoute = location.pathname === `/posts/${post.id}`
  const navigate = useNavigate()
  const [deleteDialog, setDeleteDialog] = useState(false)
  const goToPost = (): void => {
    if (isOwnRoute) return
    navigate(`/posts/${post.id}`)
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
    axios.delete(`/api/posts/delete/${post.id}`)
      .then(() => {
        toast.success('Post deleted')
        if (revalidator) {
          revalidator.revalidate()
        }
        navigate('/home')
      })
      .catch(error => {
        toast.error('Error deleting post')
        console.error('Error deleting post:', error)
      })
  }
  const maxLength = 300
  const shortBody = fullPost ? post.body : post.body?.slice(0, maxLength) + '...'
  const isTruncated = (shortBody?.length && post?.body?.length) ? shortBody.length < post.body.length : false
  const afterSave = (post: PostSummary): void => {
    setPost(post)
    setEditing(false)
  }
  const getFullUrl = (): string => {
    return `${window.location.origin}/posts/${post.id}`
  }
  return (
    <>
    {editing
      ? <>
      <FormPost post={post} onCancel={() => { setEditing(false) }} afterSave={afterSave} />

      </>
      : <div className={'mt-2 w-full border-0  drop-shadow-none mr-2'}>
      <div className={`drop-shadow-none ${!isOwnRoute ? 'cursor-pointer' : ''}`} onClick={goToPost}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className={'md:col-span-2 p-2 border-1 drop-shadow-lg  border border-gray rounded-md relative'}>
            {!post.published &&
              <>
              <div className='bg-yellow w-full p-0 text-center absolute left-0 top-0 b-4 rounded-t-md'>Draft</div>
              {/* spacer to push down the conent below */}
              <div className='h-6'> </div>
              </>
            }
            {!post.live && post.published && post.publishAt &&
              <>
                <div className='bg-green-500 w-full p-0 text-white text-center absolute left-0 top-0 b-4 rounded-t-md'>Scheduled for {format(post.publishAt, dateTimeFormat)}</div>
                <div className='h-6'> </div>
              </>
            }
            <div className="flex items-start">
              <AvatarLoader object={post} marginClass='mr-4'/>
              <div className="flex flex-col w-full h-full">
              <div className='font-bold my-2'>{post.title}</div>
              {post.body && textToJSX(post.body)}

              {isTruncated && <span className='text-xs underline text-blue cursor-pointer mr-1 text-right italic' onClick={goToPost}> more</span>}
              <div className='mt-4'>
              {post.videoMeta?.secure_url && <video className="recorded" src={post.videoMeta.secure_url} onClick={(event) => { event?.stopPropagation() }} controls />}

              {post.imageMeta?.secure_url && <img src={post.imageMeta.secure_url} alt="post picture" className="mt-4 cursor-pointer max-w-[200px]" onClick={handlePhotoClick} />}
              </div>
              {currentUser?.id === post.userId && !isShare && isOwnRoute &&
                <div className="mt-2 text-xs text-gray-500 w-full text-right">
                    <span className='underline cursor-pointer mr-1' onClick={handleEdit}>edit</span>
                    <span className='underline cursor-pointer mr-1' onClick={handleDeleteDialog}>delete</span>
                </div>
              }
              </div>
            </div>
            {deleteDialog && <DialogDelete prompt='Are you sure you want to delete this note?' isOpen={deleteDialog} deleteCallback={(event: any) => { handleDelete(event) }} onCancel={cancelDialog}/>}
          </Card>
        </div>
        {/* <span className="text-xs text-gray-500">2 hours ago</span> */}
      </div>
      {!isShare && !hideMeta &&
        <>
          <hr />
          <div className="grid grid-cols-3 text-center py-2 cursor-pointer w-full">
            <div className="flex justify-center items-center">
              <Link to={`/posts/${post.id}/comments#comments`}>
              <FaRegComment className="text-grey mr-1 inline" />
              <span className="text-xs">{post._count?.comments} comments</span>
              </Link>
            </div>
            <div className="flex justify-center items-center cursor-pointer">

            <div className='mr-2'><Liker isLiked={Boolean(hasLiked)} itemId={Number(post.id)} itemType='post' count={Number(totalLikes)}/></div>
            </div>
            {post.public && post.published &&
            <div className="flex justify-center items-center cursor-pointer">
              <ShareMenu copyUrl={getFullUrl()} itemType='post' itemId={post.id}/>
            </div>
            }
          </div>
        </>
      }
    </div>
    }
    {(post.image && showLightbox) && <Lightbox medium={post.image} large={post.image} alt="post photo" onClose={() => { setShowLightbox(false) }}/>}
    </>
  )
}
