import { useNavigate } from '@remix-run/react'
import { useContext } from 'react'
import { CurrentUserContext } from '~/utils/CurrentUserContext'

export default function useGatedNavigate (): (path: string, gated?: boolean) => void {
  const { currentUser } = useContext(CurrentUserContext)
  const _navigate = useNavigate()
  const navigate = (path: string, gated = false): void => {
    if (gated) {
      if (currentUser) {
        _navigate(path)
      } else {
        const redirectTo = path
        _navigate(`/signup?redirectTo=${redirectTo}`)
      }
    } else {
      _navigate(path)
    }
  }
  return navigate
}
