import { prisma } from '~/models/prisma.server'
import { type ActionFunction, type LoaderFunction  } from 'react-router';
import { requireCurrentUser } from '~/models/auth.server'

export const loader: LoaderFunction = async (args) => {
  void requireCurrentUser(args)
  return { message: 'This route does not accept GET requests' }
}

export const action: ActionFunction = async (args) => {
  void requireCurrentUser(args)
  const { params, request } = args
  const memberChallenge = await prisma.memberChallenge.findUnique({
    where: { id: Number(params.id) }
  })
  if (!memberChallenge) {
    return { message: 'Member challenge not found' }
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
    return { result }
  } catch (error) {
    return { message: 'Error updating member challenge' }
  }
}
