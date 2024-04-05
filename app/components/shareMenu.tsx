import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SlShareAlt } from 'react-icons/sl'
import { copyToClipboard } from '../utils/helpers'

interface ShareMenuProps {
  copyUrl: string
  itemType: string
  itemId: string | number
}

export default function ShareMenu (props: ShareMenuProps): JSX.Element {
  const { copyUrl, itemType, itemId } = props
  const [showMenu, setShowMenu] = useState(false)
  const navigate = useNavigate()
  const shareOnTimeline = (): void => {
    if (itemType === 'challenge') {
      navigate(`/challenges/${itemId}/quote`)
    } else if (itemType === 'note') {
      navigate(`/notes/${itemId}/quote`)
    }
  }
  const handleShareMenu = (): void => {
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
    <>
    <SlShareAlt className="text-gray text-sm mr-1" onClick={handleShareMenu}/>
    <span className="text-xs" onClick={handleShareMenu}>Share</span>
    {showMenu &&
      <div className='absolute right-0 bottom-10 bg-white border border-gray rounded-md flext-1 text-left' >
        <p className='cursor-pointer hover:bg-gray-100 p-2' onClick={shareOnTimeline}>Share on Timeline</p>
        <p className='cursor-pointer hover:bg-gray-100 p-2' onClick={async () => { await copyToClipboard(copyUrl) }}>Copy Link</p>
      </div>
    }
    </>
  )
}
