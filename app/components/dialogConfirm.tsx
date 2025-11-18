import React, { useState, useEffect, JSX } from 'react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogDescription, DialogFooter } from '~/components/ui/dialog'

interface DeleteDialogProps {
  prompt: string
  isOpen: boolean
  onConfirm: (event: any) => void
  onCancel?: (event: any) => void
}

export default function DialogConfirm (props: DeleteDialogProps): JSX.Element {
  const { prompt, isOpen, onConfirm, onCancel } = props
  const [open, setOpen] = useState(isOpen)
  useEffect(() => {
    setOpen(isOpen)
  }, [isOpen])
  const handleOpen = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    setOpen(!open)
    if (onCancel) onCancel(event)
  }
  return (
    <Dialog open={open} onOpenChange={handleOpen} size='xs'>
        <div>
          {prompt}
        </div>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={onCancel}
            className="mr-1"
          >
            <span>Cancel</span>
          </Button>
          <Button className="bg-red" onClick={onConfirm}>
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>
  )
}
