import { useSearchParams } from '@remix-run/react'
import { useMemberContext } from '~/contexts/MemberContext'

export default function useCohortId (): number | null {
  const { membership } = useMemberContext()
  const [searchParams] = useSearchParams()
  const cohortId = membership?.cohortId ?? searchParams.get('cohortId')
  return cohortId ? Number(cohortId) : null
}
