import { createContext } from 'react'
import { type User } from './types.client'

export interface CurrentUserContextType {
  currentUser: User | null
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>
}
export const CurrentUserContext = createContext<CurrentUserContextType>({
  currentUser: null,
  setCurrentUser: () => {}
})
