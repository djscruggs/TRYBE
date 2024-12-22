import { useLocation, useNavigate } from '@remix-run/react'
import { useContext } from 'react'
import { CurrentUserContext } from '~/utils/CurrentUserContext'

export default function useGatedNavigate (): (path: string) => void {
  const { currentUser } = useContext(CurrentUserContext)
  const _navigate = useNavigate()
  const location = useLocation()
  const navigate = (path: string): void => {
    if (currentUser) {
      _navigate(path)
    } else {
      const redirectTo = path
      _navigate(`/signup?redirectTo=${redirectTo}`)
    }
  }
  return navigate
}
