import { useSearchParams } from '@remix-run/react'
import { MemberContext } from '~/utils/MemberContext'
import { useContext } from 'react'

export default function useCohortId (): number | null {
  const { membership } = useContext(MemberContext)
  const [searchParams] = useSearchParams()
  const cohortId = membership?.cohortId ?? searchParams.get('cohortId')
  return cohortId ? Number(cohortId) : null
}
