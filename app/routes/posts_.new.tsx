import { requireCurrentUser } from '../models/auth.server'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import { useContext } from 'react'
import FormNote from '../components/formNote'

export const loader: LoaderFunction = async (args) => {
  return await requireCurrentUser(args)
}

export default function PostsNew ({ children }: { children: React.ReactNode }) {
  const { currentUser } = useContext(CurrentUserContext)
  return (
          <div className='w-full max-w-lg mt-10'>
            <FormNote />
          </div>
  )
}
