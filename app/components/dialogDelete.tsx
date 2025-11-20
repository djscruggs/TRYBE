import React, { useState, JSX } from 'react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter } from '~/components/ui/dialog'

interface DeleteDialogProps {
  isOpen: boolean
  deleteCallback: (event: any) => void
  onCancel?: (event: any) => void
  prompt: string
}

export default function DialogDelete (props: DeleteDialogProps): JSX.Element {
  const { isOpen, deleteCallback, prompt, onCancel } = props
  const [open, setOpen] = useState(isOpen)
  const handleOpen = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    setOpen(!open)
    if (onCancel) onCancel(event)
  }
  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogDescription>
          {prompt}
        </DialogDescription>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={onCancel}
            className="mr-1"
          >
            <span>Cancel</span>
          </Button>
          <Button className="bg-red" onClick={deleteCallback}>
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
