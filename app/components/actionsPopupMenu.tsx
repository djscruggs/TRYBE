import { Spinner } from '~/components/ui/spinner';
import { HiDotsHorizontal } from 'react-icons/hi'
import { toast } from 'react-hot-toast'
import { CurrentUserContext } from '~/contexts/CurrentUserContext'
import { useContext, useState, useRef, useEffect, JSX } from 'react'
import DialogDelete from './dialogDelete'
import axios from 'axios'
import type { Comment, CheckIn, Post } from '~/utils/types'

interface ActionsPopupMenuProps {
  object: Comment | CheckIn | Post
  type: string
  editCallback: (event: any) => void
  afterDelete: (object: any) => void
  className?: string
}

const ActionsPopupMenu = ({ object, type, editCallback, afterDelete, className }: ActionsPopupMenuProps): JSX.Element => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { currentUser } = useContext(CurrentUserContext)
  const toggleMenu = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    setMenuOpen(!menuOpen)
  }
  useEffect(() => {
    function handleClickOutside (event: MouseEvent): void {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    function handleKeyDown (event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuRef])
  const handleEdit = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    editCallback(event)
  }

  const handleDelete = async (event: any): Promise<void> => {
    setMenuOpen(false)
    event.preventDefault()
    event.stopPropagation()
    if (!object) return
    setDeleting(true)
    try {
      const formData = new FormData()
      formData.append('id', object.id.toString())
      if (type === 'comment') {
        formData.append('intent', 'delete')
        await axios.post('/api/comments', formData)
        toast.success('Comment deleted')
      } else if (type === 'checkin') {
        await axios.post('/api/checkins/delete/' + object.id, formData)
        toast.success('Checkin deleted')
      } else if (type === 'post') {
        await axios.post('/api/posts/delete/' + object.id, formData)
        toast.success('Post deleted')
      }
      afterDelete(object)
    } catch (error) {
      toast.error('Error deleting comment: ' + String(error))
    } finally {
      setDeleteDialog(false)
      setDeleting(false)
    }
  }

  const cancelDialog = (event: any): void => {
    event.preventDefault()
    setDeleteDialog(false)
  }
  if (object.user?.id !== currentUser?.id) return <></>

  return (
    <div className={`text-xs text-gray-500 w-sm ${className}`}>
      <div className="relative -mt-1 w-20">
        <button onClick={toggleMenu} className="p-1 rounded-full hover:bg-gray-200">
          <HiDotsHorizontal className='h-4 w-4 cursor-pointer' />
        </button>
        {menuOpen && (
          <div ref={menuRef} className="absolute right-0 bottom-full mt-2 w-20 bg-white border border-gray-200 rounded shadow-lg">
            <ul className='flex flex-col'>
              <li className="px-4 py-2 w-full text-left hover:bg-gray-100 cursor-pointer" onClick={handleEdit}>Edit</li>
              <li className="px-4 py-2 w-full text-left hover:bg-gray-100 cursor-pointer" onClick={() => { setDeleteDialog(true) }}>
                {deleting ? <Spinner className='h-4 w-4' /> : 'Delete'}
              </li>
            </ul>
          </div>
        )}
      </div>
      {deleteDialog && <DialogDelete prompt='Are you sure you want to delete?' isOpen={deleteDialog} deleteCallback={(event: any) => { handleDelete(event).catch(err => { console.error(err) }) }} onCancel={cancelDialog}/>}
    </div>
  )
}

export default ActionsPopupMenu
