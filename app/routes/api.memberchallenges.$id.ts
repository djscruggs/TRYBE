import { prisma } from '~/models/prisma.server'
import { type ActionFunction, json, type LoaderFunction } from '@remix-run/node'
import { requireCurrentUser } from '~/models/auth.server'

export const loader: LoaderFunction = async (args) => {
  void requireCurrentUser(args)
  return json({ message: 'This route does not accept GET requests' }, 200)
}

export const action: ActionFunction = async (args) => {
  void requireCurrentUser(args)
  const { params, request } = args
  const memberChallenge = await prisma.memberChallenge.findUnique({
    where: { id: Number(params.id) }
  })
  if (!memberChallenge) {
    return json({ message: 'Member challenge not found' }, 404)
  }
  try {
    const formData = await request.formData()
    const notificationHour = formData.get('notificationHour') as string
    const notificationMinute = formData.get('notificationMinute') as string
    const startAt = formData.get('startAt') as string
    const startAtDate = startAt ? new Date(startAt.toString()) : undefined
    const notificationHourNumber = notificationHour != null ? Number(notificationHour.toString()) : undefined
    const notificationMinuteNumber = notificationMinute != null ? Number(notificationMinute.toString()) : undefined
    const data = {
      ...(notificationHourNumber !== undefined && { notificationHour: notificationHourNumber }),
      ...(notificationMinuteNumber !== undefined && { notificationMinute: notificationMinuteNumber }),
      ...(startAtDate !== undefined && { startAt: startAtDate })
    }
    const result = await prisma.memberChallenge.update({
      where: { id: Number(params.id) },
      data
    })
    return json({ result }, 200)
  } catch (error) {
    return json({ message: 'Error updating member challenge' }, 500)
  }
}
