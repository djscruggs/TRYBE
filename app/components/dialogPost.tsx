import { Dialog } from '~/utils/material-tailwind';
import { useState, useEffect, JSX } from 'react'
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
    <Dialog open={isOpen} handler={handleOpen} className='p-2 pt-3 w-full bg-gray-100 relative'>
      <MdOutlineClose className='absolute top-1 right-2 text-gray-600 hover:text-gray-800 cursor-pointer' onClick={handleOpen} />
      {showCard &&
      <>
        <div className='flex items-start justify-center max-h-[600px] md:max-h-screen w-full overflow-y-auto'>
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
