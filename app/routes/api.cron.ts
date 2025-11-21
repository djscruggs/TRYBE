import { sendScheduledPosts, sendDayNumberPosts } from '~/models/cron.server'
import type { LoaderFunction } from 'react-router'

export const loader: LoaderFunction = async (args) => {
  const scheduledPosts = await sendScheduledPosts()
  const { dayNumberPosts, dayNotifications } = await sendDayNumberPosts()
  return ({ scheduledPosts, dayNumberPosts, dayNotifications }, 200)
}
