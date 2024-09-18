import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SlShareAlt } from 'react-icons/sl'
import { copyToClipboard } from '~/utils/helpers'

interface ShareMenuProps {
  copyUrl: string
  itemType: string
  itemId: string | number
  isPreview?: boolean
}

export default function ShareMenu (props: ShareMenuProps): JSX.Element {
  const { copyUrl, itemType, itemId, isPreview } = props
  const [showMenu, setShowMenu] = useState(false)
  const navigate = useNavigate()
  const shareOnTimeline = (): void => {
    if (isPreview) {
      return
    }
    if (itemType === 'challenge') {
      navigate(`/challenges/v/${itemId}/share`)
    } else if (itemType === 'note') {
      navigate(`/notes/${itemId}/quote`)
    } else if (itemType === 'post') {
      navigate(`/posts/${itemId}/share`)
    }
  }
  const handleShareMenu = (event: any): void => {
    if (isPreview) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    setShowMenu(!showMenu)
  }
  useEffect(() => {
    function handleClickEvent (event: MouseEvent): void {
      setShowMenu(false)
    }
    document.addEventListener('click', handleClickEvent)
    return () => {
      document.removeEventListener('click', handleClickEvent)
    }
  }, [showMenu])
  return (
    <div className='relative'>
      <div className="flex items-center">
        <SlShareAlt className="cursor-pointer text-grey text-sm mr-1 inline" onClick={handleShareMenu}/>
        <span className="cursor-pointer text-xs inline" onClick={handleShareMenu}>Share</span>
      </div>
      {showMenu &&
        <div className='cursor-pointer w-32 absolute left-0 bottom-8 bg-white border border-gray rounded-md flex flex-col text-left' >
          {/* <p className='text-black text-sm hover:bg-gray-100 p-1' onClick={shareOnTimeline}>Share on Timeline</p> */}
          <p className='text-black text-sm hover:bg-gray-100 p-1' onClick={async () => { await copyToClipboard(copyUrl) }}>Copy Link</p>
        </div>
      }
    </div>
  )
}
