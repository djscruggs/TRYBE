import { joinChallenge, unjoinChallenge, loadChallenge } from '~/models/challenge.server'
import { requireCurrentUser } from '~/models/auth.server'
import { loadUser } from '~/models/user.server'
import { json, type LoaderFunction, type ActionFunctionArgs } from '@remix-run/node'
import type { MemberChallenge } from '@prisma/client'
import { type ChallengeWelcomeMailerProps, sendChallengeWelcome } from '~/utils/mailer'
import { formatDate, textToHtml, convertYouTubeLinksToImages } from '~/utils/helpers'
import getUserLocale from 'get-user-locale'
import { differenceInCalendarDays } from 'date-fns'
export async function action (args: ActionFunctionArgs): Promise<Response> {
  const currentUser = await requireCurrentUser(args)
  const { params } = args
  const user = await loadUser(currentUser?.id)
  const memberChallenge = user.memberChallenges.find((c: MemberChallenge) => c.challengeId === Number(params.id))

  try {
    if (memberChallenge) {
      const result = await unjoinChallenge(Number(user.id), Number(params.id))
      return new Response(JSON.stringify({
        result: 'unjoined',
        data: result
      }), { status: 200 }) // 200 OK
    } else {
      // load the challenge
      const challenge = await loadChallenge(Number(params.id))
      if (!challenge) {
        throw new Error('Challenge with id ' + params.id + ' not found')
      }
      let result: MemberChallenge
      const baseUrl = new URL(args.request.url).origin // Get the base URL from the request
      const tempData: Partial<ChallengeWelcomeMailerProps['dynamic_template_data']> = {
        challengeName: challenge.name ?? '',
        inviteLink: `${baseUrl}/challenges/v/${params.id}/about?invite=true`, // Construct the invite link
        // description: textToHtml(convertYouTubeLinksToImages(challenge.description ?? '', `${baseUrl}/challenges/v/${params.id}/about`))
        description: textToHtml(challenge.description ?? '')
      }
      if (challenge?.type === 'SELF_LED') {
        const formData = await args.request.formData()
        const notificationHour = formData.get('notificationHour') as string
        const notificationMinute = formData.get('notificationMinute') as string
        const startAt = formData.get('startAt') as string
        const startAtDate = startAt ? new Date(startAt.toString()) : undefined
        const notificationHourNumber = notificationHour != null ? Number(notificationHour.toString()) : undefined
        const notificationMinuteNumber = notificationMinute != null ? Number(notificationMinute.toString()) : undefined
        result = await joinChallenge(Number(user.id), Number(params.id), startAtDate, notificationHourNumber, notificationMinuteNumber)
        tempData.startDate = formatDate(startAtDate?.toISOString() ?? '', getUserLocale())
        tempData.duration = challenge.numDays?.toString() + ' days' ?? 'none'
      } else {
        result = await joinChallenge(Number(user.id), Number(params.id))
        tempData.startDate = formatDate(challenge.startAt?.toISOString() ?? '', getUserLocale())
        tempData.duration = differenceInCalendarDays(challenge.endAt ?? new Date(), challenge.startAt ?? new Date()).toString() + ' days'
      }

      await sendChallengeWelcome({
        to: user.email,
        dynamic_template_data: tempData as ChallengeWelcomeMailerProps['dynamic_template_data']
      })
      return new Response(JSON.stringify({
        result: 'joined',
        data: result
      }), { status: 201 }) // 201 Created
    }
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({
      result: 'error',
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    }), { status: 400 }) // 400 Bad Request
  }
}
export const loader: LoaderFunction = async (args) => {
  void requireCurrentUser(args)
  return json({ message: 'This route does not accept GET requests' }, 200)
}
