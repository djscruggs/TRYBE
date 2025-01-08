import { createContext } from 'react'
import { type MemberChallenge } from './types'

export interface MemberContextType {
  membership: MemberChallenge | null
  setMembership: React.Dispatch<React.SetStateAction<MemberChallenge | null>>
}
export const MemberContext = createContext<MemberContextType>({
  membership: null,
  setMembership: () => {}
})
