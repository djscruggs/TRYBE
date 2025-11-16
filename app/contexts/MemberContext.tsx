import { createContext, type ReactNode, useContext, useState, useMemo, useCallback, JSX } from 'react'
import { type MemberChallenge, type CheckIn, type Challenge } from '~/utils/types'
import { useCurrentUser } from '~/contexts/CurrentUserContext'
import axios from 'axios'

export interface MemberContextType {
  membership: MemberChallenge | null
  setMembership: React.Dispatch<React.SetStateAction<MemberChallenge | null>>
  refreshUserCheckIns: () => Promise<CheckIn[]>
  getUserCheckIns: () => CheckIn[]
  loading: boolean
  updated: boolean
  challenge: Challenge | null
  setChallenge: React.Dispatch<React.SetStateAction<Challenge | null>>
}

const defaultValues: MemberContextType = {
  membership: null,
  setMembership: () => {},
  refreshUserCheckIns: async () => [],
  getUserCheckIns: () => [],
  loading: false,
  updated: false,
  challenge: null,
  setChallenge: () => {}
}

const MemberContext = createContext<MemberContextType>(defaultValues)

interface MemberContextProviderProps {
  children: ReactNode
  membership: MemberChallenge | null
  setMembership: React.Dispatch<React.SetStateAction<MemberChallenge | null>>
  challenge: Challenge | null
  setChallenge: React.Dispatch<React.SetStateAction<Challenge | null>>
}

export const MemberContextProvider = ({
  children,
  membership,
  setMembership,
  challenge,
  setChallenge
}: MemberContextProviderProps): JSX.Element => {
  const { currentUser } = useCurrentUser()
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [loading, setLoading] = useState(false)
  const [updated, setUpdated] = useState(false)

  const refreshUserCheckIns = useCallback(async (): Promise<CheckIn[]> => {
    if (!membership?.user && !membership?.userId && membership?.challenge.userId !== currentUser?.id) {
      setCheckIns([])
      return []
    }
    setLoading(true)
    try {
      const uid = membership?.userId ?? currentUser?.id
      let url = `/api/checkins/${membership?.challengeId}/${uid}`
      if (membership?.challenge.type === 'SELF_LED' && membership?.cohortId) {
        url += `/${membership.cohortId}`
      }
      const response = await axios.get(url)
      setCheckIns(response.data.checkIns as CheckIn[])
      setUpdated(true)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
    return checkIns
  }, [membership, currentUser?.id, checkIns])

  const getUserCheckIns = useCallback((): CheckIn[] => {
    return checkIns
  }, [checkIns])

  const value = useMemo(() => ({
    membership,
    setMembership,
    refreshUserCheckIns,
    getUserCheckIns,
    loading,
    updated,
    challenge,
    setChallenge
  }), [membership, refreshUserCheckIns, getUserCheckIns, loading, updated, challenge])

  return (
    <MemberContext.Provider value={value}>
      {children}
    </MemberContext.Provider>
  )
}

export const useMemberContext = (): MemberContextType => {
  const context = useContext(MemberContext)
  if (!context) {
    throw new Error('useMemberContext must be used within a MemberContextProvider')
  }
  return context
}
