import ChallengeForm from '~/components/formChallenge'
import { useEffect, useState, JSX } from 'react'
import axios from 'axios'
import { type ChallengeSummary } from '~/utils/types'
import { type MetaFunction, useParams, type LoaderFunction, redirect } from 'react-router';
import { getCurrentUser } from '~/models/auth.server'
import { prisma } from '~/models/prisma.server'

interface ChallengeInputs extends ChallengeSummary {
  deleteImage: boolean
}

export const loader: LoaderFunction = async (args) => {
  const currentUser = await getCurrentUser(args)
  if (!currentUser) {
    return redirect('/login')
  }

  const { params } = args
  if (!params.id) {
    return redirect('/challenges')
  }

  // Check if user is owner or admin
  const challenge = await prisma.challenge.findUnique({
    where: { id: Number(params.id) },
    select: { userId: true }
  })

  if (!challenge) {
    return redirect('/challenges')
  }

  const isOwner = challenge.userId === currentUser.id
  const isAdmin = currentUser.role === 'ADMIN'

  if (!isOwner && !isAdmin) {
    return redirect(`/challenges/v/${params.id}`)
  }

  return null
}

export const meta: MetaFunction = () => {
  return [
    { title: 'Edit Challenge' },
    {
      property: 'og:title',
      content: 'Edit Challenge'
    }
  ]
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
