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

export const action: ActionFunction = async ({ request }) => {
  const headers = request.headers
  const payload = await request.text()
  const svix_id = headers.get('svix-id')!
  const svix_timestamp = headers.get('svix-timestamp')!
  const svix_signature = headers.get('svix-signature')!

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.log('no svix headers')
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }
  const bodyJson = JSON.parse(payload)
  console.log('bodyJson', bodyJson)

  // @todo fix this
  // NOT WORKING
  // Attempt to verify the incoming webhook
  // const wh = new Webhook(WEBHOOK_SECRET)
  // If successful, the payload will be available from 'evt'
  // If the verification fails, error out and  return error code
  // try {
  //   console.log('starting verify, payload is ')
  //   console.log(payload)
  //   evt = wh.verify(payload, {
  //     'svix-id': svix_id,
  //     'svix-timestamp': svix_timestamp,
  //     'svix-signature': svix_signature
  //   })
  //   console.log('succeded')
  // } catch (err: any) {
  //   console.log('Failed')
  //   // Console log and return error
  //   console.log('Webhook failed to verify. Error:', err.message)
  //   return response.status(400).json({
  //     success: false,
  //     message: err.message
  //   })
  // }
  // Grab the ID and TYPE of the Webhook

  console.log(`Webhook with type ${bodyJson.type}`)
  try {
    if (bodyJson.type === 'user.created') {
      const data = {
        email: bodyJson.data.email_addresses[0].email_address,
        firstName: bodyJson.data.first_name,
        lastName: bodyJson.data.last_name,
        clerkId: bodyJson.data.id,
        profileImage: bodyJson.data.image_url,
        lastLogin: new Date()
      }
      console.log('data to create', data)
      const user = await createUser(data)
      console.log('user', user)
    }
    if (bodyJson.type === 'session.created') {
      console.log('updating lastLogin')
      const data = {
        clerkId: bodyJson.data.user_id,
        lastLogin: new Date()
      }
      console.log('data', data)
      await updateUser(
        {
          clerkId: bodyJson.data.user_id,
          lastLogin: new Date()
        }
      )
    }
    if (bodyJson.type === 'user.deleted') {
      console.log('deleting user')
      await deleteUser({ clerkId: bodyJson.data.id })
    }
  } catch (e) {
    console.log('error in user operation', e)
  }
  // Console log the full payload to view
  console.log('Webhook body:', bodyJson)
  return json({ message: 'Webhook received' }, {
    status: 200,
    statusText: 'OK',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const loader: LoaderFunction = async (args) => {
  return json({ message: 'This route does not accept GET requests' }, 200)
}
