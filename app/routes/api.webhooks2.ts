/* eslint-disable @typescript-eslint/naming-convention */
import { json, type LoaderFunction, type ActionFunction } from '@remix-run/node'
import { updateUser, createUser, deleteUser } from '../models/user.server'
import { Webhook } from 'svix'

// @see https://clerk.com/docs/integrations/webhooks/sync-data
// {
//   "data": {
//     // The event type specific payload will be here.
//   },
//   "object": "event",
//   "type": "<event>"
// }

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

if (!WEBHOOK_SECRET) {
  throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
}

export const loader: LoaderFunction = async (args) => {
  const data = {
    email: 'me+clerk@derekscruggs.com',
    firstName: 'DJ',
    lastName: 'Scruggs',
    clerkId: 'user_2dvpZhTQ9AdnvVsFj2pPJO31JZX',
    profileImage: 'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yZHZwWmpUcVdaVllva0hCbUVGcHBLUTdqaXMifQ',
    lastLogin: new Date()
  }
  const user = await createUser(data)
  console.log('user', user)
  return json(user)
}

export const loader2: LoaderFunction = async (args) => {
  return json({ message: 'This route does not accept GET requests' }, 200)
}
