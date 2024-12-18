import { joinChallenge, unjoinChallenge } from '~/models/challenge.server'
import { requireCurrentUser } from '~/models/auth.server'
import { loadUser } from '~/models/user.server'
import { json, type LoaderFunction, type ActionFunctionArgs } from '@remix-run/node'
import type { MemberChallenge } from '@prisma/client'

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
      const formData = await args.request.formData()
      const notificationHour = formData.get('notificationHour') as string
      const notificationMinute = formData.get('notificationMinute') as string
      const startAt = formData.get('startAt') as string
      const startAtDate = startAt ? new Date(startAt.toString()) : undefined
      const notificationHourNumber = notificationHour != null ? Number(notificationHour.toString()) : undefined
      const notificationMinuteNumber = notificationMinute != null ? Number(notificationMinute.toString()) : undefined

      const result = await joinChallenge(Number(user.id), Number(params.id), startAtDate, notificationHourNumber, notificationMinuteNumber)
      console.log('result', result)
      return new Response(JSON.stringify({
        result: 'joined',
        data: result
      }), { status: 201 }) // 201 Created
    }
  } catch (error) {
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
