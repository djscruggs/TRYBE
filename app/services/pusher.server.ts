import Pusher from 'pusher'
import type { Comment } from '~/utils/types'

// Initialize Pusher server instance
// Server-side only - uses secret key
export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER || 'us2',
  useTLS: true
})

/**
 * Broadcast a new message to all clients in a challenge chat room
 */
export async function broadcastNewMessage(
  challengeId: number,
  cohortId: number,
  comment: Comment
): Promise<void> {
  const channel = `chat-${challengeId}-${cohortId}`

  try {
    await pusher.trigger(channel, 'new-message', comment)
  } catch (error) {
    console.error('Error broadcasting message via Pusher:', error)
    // Don't throw - message is already saved to DB
    // Real-time delivery is a nice-to-have, not critical
  }
}

/**
 * Broadcast when a message is updated
 */
export async function broadcastMessageUpdated(
  challengeId: number,
  cohortId: number,
  comment: Comment
): Promise<void> {
  const channel = `chat-${challengeId}-${cohortId}`

  try {
    await pusher.trigger(channel, 'message-updated', comment)
  } catch (error) {
    console.error('Error broadcasting message update via Pusher:', error)
  }
}

/**
 * Broadcast when a message is deleted
 */
export async function broadcastMessageDeleted(
  challengeId: number,
  cohortId: number,
  commentId: number
): Promise<void> {
  const channel = `chat-${challengeId}-${cohortId}`

  try {
    await pusher.trigger(channel, 'message-deleted', { id: commentId })
  } catch (error) {
    console.error('Error broadcasting message deletion via Pusher:', error)
  }
}

/**
 * Broadcast typing indicator
 */
export async function broadcastTyping(
  challengeId: number,
  cohortId: number,
  userId: number,
  userName: string
): Promise<void> {
  const channel = `chat-${challengeId}-${cohortId}`

  try {
    await pusher.trigger(channel, 'user-typing', { userId, userName })
  } catch (error) {
    console.error('Error broadcasting typing indicator via Pusher:', error)
  }
}
