import { sendPushNotification } from '../app/services/pushNotifications.server';

/**
 * Test script for sending push notifications
 *
 * Usage:
 * 1. Get a real Expo push token from your database or mobile app logs
 * 2. Update the testToken variable below
 * 3. Run: npx tsx scripts/testPushNotification.ts
 */

async function test() {
  // Replace this with a real token from your database
  // Query: SELECT token FROM push_tokens LIMIT 1;
  const testToken = 'ExponentPushToken[REPLACE_WITH_REAL_TOKEN]';

  if (testToken === 'ExponentPushToken[REPLACE_WITH_REAL_TOKEN]') {
    console.error('❌ Please update testToken with a real Expo push token');
    console.log('\nTo get a token:');
    console.log('1. Check your database: SELECT token FROM push_tokens LIMIT 1;');
    console.log('2. Or check mobile app logs when a user signs in');
    process.exit(1);
  }

  console.log('📱 Sending test push notification...');
  console.log(`Token: ${testToken.substring(0, 30)}...`);

  const result = await sendPushNotification(testToken, {
    title: 'Test Notification',
    body: 'This is a test from the Trybe server!',
    data: { test: true }
  });

  if (result.success) {
    console.log('✅ Test notification sent successfully!');
    console.log('Check your mobile device for the notification.');
  } else {
    console.error('❌ Failed to send notification:', result.error);
  }
}

test().catch((error) => {
  console.error('❌ Test script error:', error);
  process.exit(1);
});
