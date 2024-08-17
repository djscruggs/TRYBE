import React, { useState, useEffect } from 'react'
import { Drawer } from '@material-tailwind/react'

interface ChatDrawerProps {
  isOpen: boolean
  placement: 'left' | 'right' | 'top' | 'bottom'
  onClose: () => void
  size: number
  children: React.ReactNode
}

export default function ChatDrawer (props: ChatDrawerProps): JSX.Element {
  const { isOpen, placement, onClose, size, children } = props
  const [open, setOpen] = useState(false)
  const closeDrawer = (): void => {
    setOpen(false)
    onClose()
  }
  useEffect(() => {
    setOpen(isOpen)
    if (!isOpen) {
      onClose()
    }
  }, [isOpen])
  return (
      <Drawer open={open} placement={placement} onClose={closeDrawer} className="p-0 shadow-lg" size={size}>
        <div className="absolute top-2 right-2 cursor-pointer " onClick={closeDrawer}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <div className="mb-6 pt-4 flex items-center justify-between bg-gray-100">
          <div className='p-4'>
            {children}
          </div>
        </div>
      </Drawer>
  )
}
