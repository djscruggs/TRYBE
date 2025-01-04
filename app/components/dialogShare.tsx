import { useState, useEffect } from 'react'
import { HiOutlineClipboardCopy } from 'react-icons/hi'
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader
} from '@material-tailwind/react'
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
        <div className='text-center flex justify-start items-center mt-2'>
          <div className='text-lessblack text-md border p-2 rounded-md'>{link}</div> <HiOutlineClipboardCopy onClick={copyLink} className='h-6 w-6 cursor-pointer ml-4' /><div onClick={copyLink} className='ml-1 text-blue underline cursor-pointer'>copy</div>
          {success && <div className='text-green-500 ml-2'>Link copied!</div>}
        </div>
      </DialogBody>
      <DialogFooter>
        <Button className="bg-red" onClick={handleOpen}>
          <span>Close</span>
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
