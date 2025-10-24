import { useState, useEffect } from 'react'
import { HiOutlineClipboardCopy } from 'react-icons/hi'
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader
} from '~/utils/material-tailwind'
interface DialogShareProps {
  prompt: string
  link: string
  title?: string
  isOpen: boolean
  onClose: (event: any) => void

}

export default function DialogShare (props: DialogShareProps): JSX.Element {
  const { prompt, title, link, isOpen, onClose } = props
  const [open, setOpen] = useState(isOpen)
  useEffect(() => {
    setOpen(isOpen)
  }, [isOpen])
  const handleOpen = (event: any): void => {
    setOpen(!open)
    if (onClose) onClose(event)
  }
  const [success, setSuccess] = useState<boolean>(false)
  const copyLink = async (): Promise<void> => {
    await navigator.clipboard.writeText(link)
    setSuccess(true)
  }
  return (
    <Dialog open={open} handler={handleOpen} size='xs'>
      <DialogHeader>
        <h3>{title ?? 'Share'}</h3>
      </DialogHeader>
      <DialogBody>
        <div className='font-bold mb-4'>{prompt}</div>
        <div className='flex items-center'>
          <div className='text-lessblack text-sm md:text-md  border p-2 rounded-md text-left max-w-[250px]'>{link}</div>
            <HiOutlineClipboardCopy onClick={copyLink} className='h-6 w-6 cursor-pointer ml-1' />
            <div onClick={copyLink} className='ml-1 text-blue underline cursor-pointer text-xs md:text-sm'>copy</div>

        </div>
        {success && <div className='text-green-500 ml-2'>Link copied!</div>}
      </DialogBody>
      <DialogFooter>
        <Button className="bg-red" onClick={handleOpen}>
          <span>Close</span>
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
