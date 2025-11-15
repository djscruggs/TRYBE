/* eslint-disable @typescript-eslint/naming-convention */
import { loadChallengeWithHost } from '~/models/challenge.server'
import { contactHost, type HostMailerProps } from '~/utils/mailer'
import type { ActionFunction, LoaderFunction } from 'react-router'
import {} from 'react-router'
import { requireCurrentUser } from '~/models/auth.server'
import { type CurrentUser, type ChallengeWithHost } from '~/utils/types'
export const action: ActionFunction = async (args) => {
  const currentUser: CurrentUser | null = await requireCurrentUser(args)
  if (!currentUser) {
    return { message: 'You must be logged in to create a note or thread' }
  }
  const formData = await args.request.json()
  const challengeId = Number(formData.challengeId)
  const challenge: ChallengeWithHost | null =
    await loadChallengeWithHost(challengeId)
  if (!challenge) {
    return { message: 'Challenge not found' }
  }
  const subject = String(formData.subject)
  const body = String(formData.body)
  const member_name = currentUser.profile?.fullName ?? 'Trybe User'
  const challenge_name = String(challenge.name)
  const to = challenge?.user?.email
  const replyTo = currentUser.email
  try {
    const msg: HostMailerProps = {
      to,
      replyTo,
      dynamic_template_data: {
        member_name,
        subject,
        challenge_name,
        body
      }
    }
    const result = await contactHost(msg)
    return result
  } catch (error) {
    return error
  }
}

export const loader: LoaderFunction = async () => {
  return { message: 'This route does not accept GET requests' }
}
