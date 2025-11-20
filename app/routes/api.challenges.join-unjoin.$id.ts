import {
  joinChallenge,
  unjoinChallenge,
  loadChallenge,
  createCohort
} from '~/models/challenge.server'
import { requireCurrentUser } from '~/models/auth.server'
import { loadUser } from '~/models/user.server'
import { type LoaderFunction, type ActionFunctionArgs } from 'react-router'
import type { MemberChallenge } from '@prisma/client'
import {
  type ChallengeWelcomeMailerProps,
  sendChallengeWelcome
} from '~/utils/mailer'
import {
  formatDate,
  textToHtml,
  pathToEmailUrl,
  generateUrl
} from '~/utils/helpers'
import getUserLocale from 'get-user-locale'
import { differenceInCalendarDays } from 'date-fns'

export async function action(args: ActionFunctionArgs): Promise<Response> {
  const currentUser = await requireCurrentUser(args)
  const { params } = args
  const user = await loadUser(currentUser?.id)
  const memberChallenge = user.memberChallenges.find(
    (c: MemberChallenge) => c.challengeId === Number(params.id)
  )
  try {
    if (memberChallenge) {
      const result = await unjoinChallenge(Number(user.id), Number(params.id))
      return {
        result: 'unjoined',
        data: result
      } // 200 OK
    } else {
      // load the challenge
      const challenge = await loadChallenge(Number(params.id))
      if (!challenge) {
        throw new Error('Challenge with id ' + params.id + ' not found')
      }
      let memberChallenge: MemberChallenge
      const invitePath = pathToEmailUrl(`/challenges/v/${params.id}/about?i=1`)
      const tempData: Partial<
        ChallengeWelcomeMailerProps['dynamic_template_data']
      > = {
        challengeName: challenge.name ?? '',
        inviteLink: generateUrl(invitePath),
        description: textToHtml(challenge.description ?? '')
      }
      if (challenge?.type === 'SELF_LED') {
        let body
        try {
          const text = await args.request.text()
          if (!text) {
            throw new Error('Request body is empty')
          }
          body = JSON.parse(text)
        } catch (error) {
          console.error('JSON parse error:', error)
          throw new Error('Invalid request: expected JSON body with notificationHour, notificationMinute, and startAt')
        }
        if (
          (body.notificationHour == null || body.notificationHour === '') ||
          (body.notificationMinute == null || body.notificationMinute === '') ||
          !body.startAt
        ) {
          console.error('Missing fields in body:', body)
          throw new Error('Missing required fields: notificationHour, notificationMinute, and startAt')
        }
        const notificationHour = body.notificationHour as string | number
        const notificationMinute = body.notificationMinute as string | number
        const startAt = body.startAt as string
        const startAtDate = startAt ? new Date(startAt) : undefined
        const notificationHourNumber =
          notificationHour != null
            ? Number(notificationHour.toString())
            : undefined
        const notificationMinuteNumber =
          notificationMinute != null
            ? Number(notificationMinute.toString())
            : undefined
        let cohortId = Number(body.cohortId)
        if (!cohortId) {
          // create a cohort first
          const cohort = await createCohort(Number(params.id))
          cohortId = cohort.id
        }
        memberChallenge = await joinChallenge({
          userId: Number(user.id),
          challengeId: Number(params.id),
          startAt: startAtDate,
          notificationHour: notificationHourNumber,
          notificationMinute: notificationMinuteNumber,
          cohortId
        })
        tempData.startDate = formatDate(
          startAtDate?.toISOString() ?? '',
          getUserLocale()
        )
        tempData.duration = challenge.numDays?.toString()
          ? `${challenge.numDays} days`
          : 'none'
      } else {
        memberChallenge = await joinChallenge({
          userId: Number(user.id),
          challengeId: Number(params.id)
        })
        tempData.startDate = formatDate(
          challenge.startAt?.toISOString() ?? '',
          getUserLocale()
        )
        tempData.duration =
          differenceInCalendarDays(
            challenge.endAt ?? new Date(),
            challenge.startAt ?? new Date()
          ).toString() + ' days'
      }
      await sendChallengeWelcome({
        to: user.email,
        dynamic_template_data:
          tempData as ChallengeWelcomeMailerProps['dynamic_template_data']
      })
      return {
        result: 'joined',
        data: memberChallenge
      } // 201 Created
    }
  } catch (error) {
    console.error(
      'error in action',
      error instanceof Error ? error.message : error
    )
    return {
      result: 'error',
      message:
        error instanceof Error ? error.message : 'An unknown error occurred'
    } // 400 Bad Request
  }
}
export const loader: LoaderFunction = async (args) => {
  void requireCurrentUser(args)
  return { message: 'This route does not accept GET requests' }
}
