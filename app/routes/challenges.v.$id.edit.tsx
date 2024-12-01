import ChallengeForm from '~/components/formChallenge'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { type ChallengeSummary } from '~/utils/types'
import { useParams } from '@remix-run/react'
interface ChallengeInputs extends ChallengeSummary {
  deleteImage: boolean
}

export default function EditChallenge (): JSX.Element {
  const [challenge, setChallenge] = useState<ChallengeInputs | null>(null)
  const params = useParams()
  useEffect(() => {
    const loadChallenge = async (): Promise<void> => {
      const response = await axios.get('/api/challenges/v/' + params.id)
      setChallenge(response.data as ChallengeInputs)
    }
    void loadChallenge()
  }, [])
  if (!challenge) {
    return <div>Loading...</div>
  }
  return (
    <ChallengeForm challenge={challenge} />
  )
}
