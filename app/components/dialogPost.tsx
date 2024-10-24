import { useState, useEffect } from 'react'
import { Dialog } from '@material-tailwind/react'
import type { Post } from '~/utils/types'
import CardPost, { PostContent } from './cardPost'
import { MdOutlineClose } from 'react-icons/md'
interface DialogPostProps {
  post: Post
  open?: boolean
  onClose?: () => void
  children?: React.ReactNode
}

export default function DialogPost (props: DialogPostProps): JSX.Element {
  const { post, open = false, onClose, children } = props
  if (!post) {
    return <></>
  }
  const [isOpen, setIsOpen] = useState(open)
  const handleOpen = (): void => {
    setIsOpen(!isOpen)
    if (onClose) onClose()
  }
  useEffect(() => {
    setShowCard(true)
  }, [])
  const [showCard, setShowCard] = useState(false)
  return (
    <Dialog open={isOpen} handler={handleOpen} className='p-2 pt-3  bg-gray-100 relative max-h-screen overflow-y-auto'>
      <MdOutlineClose className='absolute top-1 right-2 text-gray-600 hover:text-gray-800 cursor-pointer' onClick={handleOpen} />
      {showCard &&
      <>
        <div className='flex items-center justify-center'>
          <PostContent post={post} fullPost={false} handlePhotoClick={() => {}} />
        </div>
        <div className='flex items-center justify-center -mt-4 mb-2'>
        {children}
        </div>
      </>
      }

    </Dialog>
  )
}
