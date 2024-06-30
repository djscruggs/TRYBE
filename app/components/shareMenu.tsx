import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SlShareAlt } from 'react-icons/sl'
import { copyToClipboard } from '~/utils/helpers'

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
      navigate(`/challenges/v/${itemId}/share`)
    } else if (itemType === 'note') {
      navigate(`/notes/${itemId}/quote`)
    } else if (itemType === 'post') {
      navigate(`/posts/${itemId}/share`)
    }
  }
  const handleShareMenu = (event: any): void => {
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
    <>
    <SlShareAlt className="cursor-pointer text-grey text-sm mr-1" onClick={handleShareMenu}/>
    <span className="cursor-pointer text-xs" onClick={handleShareMenu}>Share</span>
    {showMenu &&
      <div className='cursor-pointer min-w-36 absolute right-0 bottom-8 bg-white border border-gray rounded-md flex flex-col text-left' >
        <p className='hover:bg-gray-100 p-1' onClick={shareOnTimeline}>Share on Timeline</p>
        <p className='hover:bg-gray-100 p-1' onClick={async () => { await copyToClipboard(copyUrl) }}>Copy Link</p>
      </div>
    }
    </>
  )
}
