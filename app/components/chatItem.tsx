import React, { useState, useContext, useEffect } from 'react'
import FormChat from './formChat'
import { HiDotsHorizontal } from 'react-icons/hi'
import { Avatar, Spinner } from '@material-tailwind/react'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { textToJSX } from '~/utils/helpers'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import type { Comment } from '~/utils/types'
import { formatDistanceToNow } from 'date-fns'
import Liker from './liker'
import { Lightbox } from 'react-modal-image'
import DialogDelete from './dialogDelete'
interface CommentsProps {
  comment: Comment | null
  likedCommentIds: number[]

}

export default function ChatItem (props: CommentsProps): JSX.Element {
  const [comment, setComment] = useState<Comment | null>(props.comment ?? null)
  const [isLiked, setIsLiked] = useState(props?.likedCommentIds?.includes(comment?.id ?? 0))
  const [showLightbox, setShowLightbox] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const { currentUser } = useContext(CurrentUserContext)

  useEffect(() => {
    setIsLiked(props.likedCommentIds?.includes(comment?.id ?? 0))
  }, [props.likedCommentIds])
  const handleEdit = (): void => {
    setMenuOpen(false)
    if (!comment || deleting) return
    setShowForm(true)
  }
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    setMenuOpen(!menuOpen)
  }
  const handleDelete = async (event: any): Promise<void> => {
    setMenuOpen(false)
    event.preventDefault()
    event.stopPropagation()
    if (!comment) return
    setDeleting(true)
    try {
      const formData = new FormData()
      formData.append('id', comment.id.toString())
      formData.append('intent', 'delete')
      await axios.post('/api/comments', formData)
      toast.success('Comment deleted')
      setComment(null)
    } catch (error) {
      toast.error('Error deleting comment')
      console.error(error)
    } finally {
      setDeleting(false)
      setDeleteDialog(false)
    }
  }
  const cancelDialog = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    setDeleteDialog(false)
  }
  const afterSave = (comment: Comment): void => {
    setComment(comment)
    setShowForm(false)
  }
  if (!comment) return <></>
  return (
    <>
    {showForm
      ? (
        <div className='w-full border-l-2  pl-4 mb-4 pr-2'>
          <FormChat afterSave={afterSave} onPending={afterSave} type='comment' onCancel={() => { setShowForm(false) }} comment={comment} />
        </div>
        )
      : (
      <>
        <div className="w-full p-1 z-max hover:bg-gray-100 pr-2 pt-2 pl-2">
          <div className='relative break-all'>

            <div className='flex'>
              <div className='flex-shrink-0'>
                <Avatar src={comment.user?.profile?.profileImage ?? ''} className='mr-2' size='sm'/>
              </div>
              <div className='flex-grow'>
                <div className='text-xs mb-2'>{comment.user?.profile?.firstName} {comment.user?.profile?.lastName} - <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span></div>
                  {comment?.body && textToJSX(comment.body)}
                </div>
              </div>
            <div className='ml-10 mb-4'>
              {comment.imageMeta?.secure_url &&
                <div className='mt-4'>
                  <img src={comment.imageMeta.secure_url} onClick={() => { setShowLightbox(true) }} className='w-1/2 mt-2 cursor-pointer' />
                  {showLightbox &&
                    <Lightbox medium={comment.imageMeta.secure_url} large={comment.imageMeta.secure_url} alt="comment photo" onClose={() => { setShowLightbox(false) }}/>
                  }
                </div>
              }
              {comment.videoMeta?.secure_url &&
                <div className='mt-4'>
                  <video className='w-full mt-2 cursor-pointer' controls={true}>
                    <source src={comment.videoMeta.secure_url} type={`video/${comment.videoMeta.format}`} />
                  </video>
                </div>
              }
              <div className='float-right -mt-2 relative mr-1'>
                {comment.user?.id === currentUser?.id &&
                  <div className="text-xs text-gray-500 w-sm flex text-right justify-end absolute -top-1 right-8">
                      <div className="relative">
                          <button onClick={toggleMenu} className="p-1 rounded-full hover:bg-gray-200">
                              <HiDotsHorizontal className='h-4 w-4' />
                          </button>
                          {menuOpen && (
                              <div className="absolute right-0 bottom-full mt-2 w-20 bg-white border border-gray-200 rounded shadow-lg">
                                  <ul className='flex flex-col'>
                                      <li className="px-4 py-2 w-full text-left hover:bg-gray-100 cursor-pointer" onClick={handleEdit}>Edit</li>
                                      <li className="px-4 py-2 w-full text-left hover:bg-gray-100 cursor-pointer" onClick={() => { setDeleteDialog(true) }}>
                                          {deleting ? <Spinner className='h-4 w-4' /> : 'Delete'}
                                      </li>
                                  </ul>
                              </div>
                          )}
                      </div>
                      {deleteDialog && <DialogDelete prompt='Are you sure you want to delete?' isOpen={deleteDialog} deleteCallback={(event: any) => { handleDelete(event).catch(err => { console.error(err) }) }} onCancel={cancelDialog}/>}
                  </div>
                }
                <Liker isLiked={isLiked} itemId={comment.id} itemType='comment' count={comment.likeCount}/>
              </div>
            </div>

          </div>

        </div>
      </>
        )
  }
  </>
  )
}
