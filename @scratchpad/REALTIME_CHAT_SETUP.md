# Real-Time Chat Setup Guide

## 🎉 Implementation Complete!

The codebase has been updated with Pusher for real-time chat. Follow these steps to get it working.

---

## Step 1: Get Pusher Credentials

1. **Sign up for Pusher** (free tier available)
   - Go to: https://pusher.com/signup
   - Create a free account

2. **Create a new Channels app**
   - After signing in, click "Create app" or "Channels apps"
   - Choose "Channels" (not Beams)
   - Name: `trybe-chat-dev` (or whatever you prefer)
   - Cluster: Choose `us2` (or closest to your users)
   - Tech stack: Choose "React" for frontend
   - Click "Create app"

3. **Get your credentials**
   - In your new app, go to "App Keys" tab
   - You'll see:
     - `app_id`
     - `key` (this is the public key)
     - `secret`
     - `cluster`

---

## Step 2: Configure Environment Variables

Update your `.env.development` file with the Pusher credentials:

```bash
# Pusher - Real-time chat
PUSHER_APP_ID=your_app_id_here
PUSHER_KEY=your_key_here
PUSHER_SECRET=your_secret_here
PUSHER_CLUSTER=us2
```

**Replace the placeholder values** with your actual Pusher credentials from Step 1.

For production, also update `.env.production`:

```bash
# Pusher - Real-time chat
PUSHER_APP_ID=your_production_app_id
PUSHER_KEY=your_production_key
PUSHER_SECRET=your_production_secret
PUSHER_CLUSTER=us2
```

> 💡 **Tip**: You can use the same Pusher app for development and production, or create separate apps for each environment.

---

## Step 3: Restart Your Development Server

The environment variables are only loaded when the server starts, so you need to restart:

```bash
# Stop your current dev server (Ctrl+C)

# Start it again
npm run dev
```

---

## Step 4: Test Real-Time Chat

### Testing with Two Browser Windows

1. **Open the app in two different browser windows** (or use incognito mode for one)
   - Window 1: Regular browser window
   - Window 2: Incognito/private window (so you can log in as a different user)

2. **Navigate to a challenge chat** in both windows
   - Go to the same challenge
   - Make sure both users are in the chat view

3. **Send a message in Window 1**
   - Type a message and hit send
   - The message should appear **immediately** in Window 2 without refreshing!

4. **Send a message in Window 2**
   - It should appear **immediately** in Window 1

### What Should Happen

✅ **Expected behavior:**
- Messages appear instantly in all connected browsers
- No page refresh needed
- Messages show optimistically (appear immediately when you send them)
- Console logs show: `Pusher connection established` (check browser DevTools)

❌ **If it's not working:**
- Check browser console for errors
- Verify Pusher credentials are correct
- Check server logs for Pusher connection errors
- See troubleshooting section below

---

## Step 5: Verify Pusher Connection (Optional)

### In Browser DevTools

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for messages like:
   ```
   Pusher : State changed : initialized -> connecting
   Pusher : State changed : connecting -> connected
   ```

### In Pusher Dashboard

1. Go to your Pusher dashboard
2. Click on your app
3. Go to "Debug Console" tab
4. Open a challenge chat in your app
5. You should see:
   - Connection events
   - Subscription to channels like `chat-123-456`
   - Message events when you send messages

---

## How It Works

### Architecture

```
User 1 Browser                    Server                    User 2 Browser
     │                              │                              │
     │ 1. Send message              │                              │
     ├────────────────────────────► │                              │
     │    POST /api/comments         │                              │
     │                              │                              │
     │ 2. Optimistic update         │ 3. Save to database          │
     │    (message appears)          │                              │
     │                              │                              │
     │                              │ 4. Broadcast via Pusher      │
     │                              ├──────────────────────────────►│
     │                              │    (new-message event)        │
     │                              │                              │
     │ 5. Receive confirmation      │                              │ 6. Message appears
     │◄──────────────────────────── │                              │    (real-time)
```

### Files Modified

1. **`app/services/pusher.server.ts`** - New file
   - Server-side Pusher client
   - Broadcasts messages to all connected clients

2. **`app/routes/api.comments.ts`**
   - Added: Import `broadcastNewMessage`
   - Added: Broadcast after saving comment to DB

3. **`app/contexts/ChatContext.tsx`**
   - Added: Pusher client connection
   - Added: Listener for `new-message` events
   - Added: Auto-update UI when messages arrive

4. **`app/root.tsx`**
   - Added: Pusher keys to ENV
   - Added: Script to expose ENV to client

5. **Environment Files**
   - `.env.development` - Added Pusher placeholders
   - `.env.production` - Added Pusher placeholders

---

## Troubleshooting

### Error: "Pusher key not found"

**Problem:** ChatContext warns that Pusher key is not found.

**Solution:**
1. Make sure you've added `PUSHER_KEY` to `.env.development`
2. Restart your dev server
3. Hard refresh the browser (Cmd+Shift+R or Ctrl+Shift+F5)

### Error: Connection failed to Pusher

**Problem:** Browser console shows Pusher connection errors.

**Solutions:**
- **Check cluster**: Make sure `PUSHER_CLUSTER` matches your app settings
- **Check key**: Verify `PUSHER_KEY` is the public key, not secret
- **Network issues**: Check if your network blocks WebSocket connections
- **Pusher app disabled**: Check your Pusher dashboard, app should be active

### Messages not appearing in other browsers

**Problem:** Messages appear in sender's browser but not in other browsers.

**Solutions:**
1. **Check server logs** - Look for errors when broadcasting
2. **Verify both browsers are connected** - Check DevTools console
3. **Same challenge/cohort** - Make sure both users are viewing the same chat
4. **Check Pusher Debug Console** - See if events are being published

### Error: "Pusher authentication failed"

**Problem:** Server can't connect to Pusher.

**Solutions:**
- Verify `PUSHER_SECRET` in `.env.development`
- Verify `PUSHER_APP_ID` is correct
- Check that credentials match your Pusher app

---

## Next Steps

### For Production Deployment

1. **Create a production Pusher app** (or use same app)
2. **Update `.env.production`** with production credentials
3. **Set environment variables** on your hosting platform:
   ```
   PUSHER_APP_ID=xxx
   PUSHER_KEY=xxx
   PUSHER_SECRET=xxx
   PUSHER_CLUSTER=us2
   ```

### Monitoring

Pusher provides analytics in the dashboard:
- Connection count
- Message volume
- Error rates

**Free tier limits:**
- 100 concurrent connections
- 200,000 messages/day

This should be plenty for development and early production use.

### Future Enhancements

Ready to add more features? Check the implementation plan:
- [@scratchpad/realtime-chat-implementation-plan.md](@scratchpad/realtime-chat-implementation-plan.md)

Features you can add:
1. **Typing indicators** - Show when someone is typing
2. **Online presence** - Show who's currently in the chat
3. **Message delivery receipts** - Show when messages are read
4. **Browser notifications** - Notify users when app is in background
5. **Push notifications** - Using Pusher Beams for mobile app

---

## Mobile App Integration

Since you're using React Native, the next step is to integrate Pusher in the mobile app.

### Install Pusher for React Native

```bash
# In your React Native project
npm install pusher-js
npm install @react-native-community/netinfo
```

### React Native Implementation

The mobile app can use the same Pusher credentials and channel names. Example:

```typescript
import Pusher from 'pusher-js/react-native'

const pusher = new Pusher('YOUR_PUSHER_KEY', {
  cluster: 'us2',
  forceTLS: true
})

const channel = pusher.subscribe(`chat-${challengeId}-${cohortId}`)
channel.bind('new-message', (comment) => {
  // Update UI with new message
})
```

For full mobile implementation details, see:
- [@scratchpad/realtime-chat-implementation-plan.md#mobile-client-considerations](@scratchpad/realtime-chat-implementation-plan.md#mobile-client-considerations)

---

## Support

If you run into issues:

1. **Check Pusher docs**: https://pusher.com/docs/channels/
2. **Pusher support**: https://support.pusher.com/
3. **Debug console**: Use Pusher's debug console to see events in real-time

---

## Success Checklist

- [ ] Pusher account created
- [ ] App credentials added to `.env.development`
- [ ] Dev server restarted
- [ ] Two browser windows can see each other's messages in real-time
- [ ] Console shows successful Pusher connection
- [ ] Pusher debug console shows events

Once all checkboxes are complete, your real-time chat is working! 🎉
