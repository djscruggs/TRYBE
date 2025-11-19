import React, { useState, useEffect, JSX } from 'react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter } from '~/components/ui/dialog'

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
  const handleOpen = (value: boolean): void => {
    setOpen(value)
    if (!value && onCancel) {
      onCancel(value)
    }
  }
  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-md bg-white">
        <div>
          {prompt}
        </div>
        <DialogFooter>
          <Button
            variant="text"
            onClick={onCancel}
            className="mr-1 cursor-pointer"
          >
            <span>Cancel</span>
          </Button>
          <Button className="bg-red text-white cursor-pointer" onClick={onConfirm}>
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
