import React, { useContext } from 'react'
import {
  Card
} from '@material-tailwind/react'
import { useUser } from '@clerk/clerk-react'
import type { Note } from '../utils/types.server'
import { SlShareAlt } from 'react-icons/sl'
import { CiChat1 } from 'react-icons/ci'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import { Link, useNavigate } from '@remix-run/react'

export default function CardNote ({ note }: { note: Note }): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const user = useUser()
  console.log(user)
  const navigate = useNavigate()
  const goToNote = (): void => {
    navigate(`/notes/${note.id}`)
  }
  return (
    <div className={'mt-2 w-full border-0  drop-shadow-none mr-2'}>
      <div className="drop-shadow-none">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className={`md:col-span-2 p-2 border-1 drop-shadow-lg  border border-${currentUser?.id === note.userId ? 'green-500' : 'gray'} rounded-md`}>
            {note.body}
            {currentUser?.id === note.userId && <div className="mt-4 text-xs text-gray-500"><Link className='underline' to={`/notes/${note.id}/edit`}>edit</Link> <Link className='underline' to={`/notes/${note.id}/delete`}>delete</Link></div>}
          </Card>
        </div>
        {/* <span className="text-xs text-gray-500">2 hours ago</span> */}
      </div>
      <hr />
      <div className="grid grid-cols-3 text-center py-2 cursor-pointer">
        <div className="flex justify-center items-center">
        <Link to={`/notes/${note.id}/comments#comments`}>
          <CiChat1 className="text-gray mr-1 inline" />
          <span className="text-xs">{note._count.comments} comments</span>
          </Link>
        </div>
        <div className="flex justify-center items-center cursor-pointer">

          <span className="text-xs" onClick={goToNote}>{note._count.likes} likes</span>
        </div>
        <div className="flex justify-center items-center cursor-pointer">
          <SlShareAlt className="text-gray text-sm mr-1" />
          <span className="text-xs">Share</span>
        </div>
      </div>
    </div>
  )
}
