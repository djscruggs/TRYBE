import { createContext } from 'react'
import { type CurrentUser } from './types'

export interface CurrentUserContextType {
  currentUser: CurrentUser | null
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>
}
export const CurrentUserContext = createContext<CurrentUserContextType>({
  currentUser: null,
  setCurrentUser: () => {}
})
