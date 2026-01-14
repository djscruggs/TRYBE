import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { prisma } from '~/models/prisma.server';

const expo = new Expo();

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
  badge?: number;
}

export interface SendResult {
  success: boolean;
  error?: string;
}

/**
 * Send a push notification to a single device
 */
export async function sendPushNotification(
  pushToken: string,
  notification: NotificationData
): Promise<SendResult> {
  // Check if token is valid Expo push token
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    return { success: false, error: 'Invalid Expo push token' };
  }

  // Create message
  const message: ExpoPushMessage = {
    to: pushToken,
    title: notification.title,
    body: notification.body,
    data: notification.data,
    sound: notification.sound || 'default',
    badge: notification.badge,
  };

  try {
    // Send notification
    const tickets = await expo.sendPushNotificationsAsync([message]);

    // Handle receipts
    for (const ticket of tickets) {
      if (ticket.status === 'error') {
        console.error(`Error sending push notification:`, ticket.message);

        // Check if ticket has details property (type guard)
        if ('details' in ticket && ticket.details?.error === 'DeviceNotRegistered') {
          // Token is invalid - remove from database
          await removePushToken(pushToken);
        }

        return { success: false, error: ticket.message };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send push notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Send push notifications to multiple devices in batch
 */
export async function sendBatchPushNotifications(
  recipients: Array<{ token: string; notification: NotificationData }>
): Promise<{ sent: number; failed: number }> {
  // Filter valid tokens and create messages
  const messages: ExpoPushMessage[] = recipients
    .filter(r => Expo.isExpoPushToken(r.token))
    .map(r => ({
      to: r.token,
      title: r.notification.title,
      body: r.notification.body,
      data: r.notification.data,
      sound: r.notification.sound || 'default',
      badge: r.notification.badge,
    }));

  let sent = 0;
  let failed = 0;

  // Expo recommends sending max 100 at a time
  const chunks = expo.chunkPushNotifications(messages);

  for (const chunk of chunks) {
    try {
      const tickets = await expo.sendPushNotificationsAsync(chunk);

      // Handle tickets
      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        if (ticket.status === 'error') {
          failed++;
          console.error('Push notification error:', ticket.message);

          // Check if ticket has details property (type guard)
          if ('details' in ticket && ticket.details?.error === 'DeviceNotRegistered') {
            // Remove invalid token
            const originalMessage = chunk[i];
            if (typeof originalMessage.to === 'string') {
              await removePushToken(originalMessage.to);
            }
          }
        } else {
          sent++;
        }
      }
    } catch (error) {
      console.error('Batch notification error:', error);
      failed += chunk.length;
    }
  }

  return { sent, failed };
}

/**
 * Remove an invalid push token from the database
 */
async function removePushToken(token: string): Promise<void> {
  try {
    await prisma.pushToken.delete({
      where: { token }
    });
    console.log(`Removed invalid push token: ${token}`);
  } catch (error) {
    console.error('Error removing push token:', error);
  }
}
