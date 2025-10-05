/* eslint-disable @typescript-eslint/naming-convention */
import { json, type LoaderFunction, type ActionFunction } from 'react-router';
import { updateUser, createUser, deleteUser } from '~/models/user.server'
import { Webhook } from 'svix'
import { prisma } from '~/models/prisma.server'
import { sendWelcomeEmail } from '~/utils/mailer'
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
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }
  const bodyJson = JSON.parse(payload)

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

  try {
    if (bodyJson.type === 'user.created') {
      // email_addresses is an array, but one is primary
      // set it by finding the one that matches the primary_email_address_id
      const primaryEmailAddress = bodyJson.data.email_addresses.find((address: any) => address.id === bodyJson.data.primary_email_address_id).email_address
      const data = {
        email: primaryEmailAddress,
        firstName: bodyJson.data.first_name,
        lastName: bodyJson.data.last_name,
        clerkId: bodyJson.data.id,
        profileImage: bodyJson.data.profile_image_url,
        lastLogin: new Date()
      }
      const user = await createUser(data)
      try {
        await sendWelcomeEmail({ to: user.email })
      } catch (e) {
        console.error('error in sendWelcomeEmail', e)
      }
    }
    if (bodyJson.type === 'user.updated') {
      // first get user id from clerk id
      const user = await prisma.user.findFirst({
        where: {
          clerkId: bodyJson.data.id
        },
        include: {
          profile: true
        }
      })
      // update email address
      const primaryEmailAddress = bodyJson.data.email_addresses.find((address: any) => address.id === bodyJson.data.primary_email_address_id).email_address
      await prisma.user.update({
        where: {
          id: user?.id
        },
        data: {
          email: primaryEmailAddress
        }
      })
      // update profile
      const profileId = user?.profile.id
      const data = {
        firstName: bodyJson.data.first_name,
        lastName: bodyJson.data.last_name,
        profileImage: bodyJson.data.profile_image_url
      }
      await prisma.profile.update({
        where: {
          id: profileId
        },
        data
      })
    }
    if (bodyJson.type === 'session.created') {
      const data = {
        clerkId: bodyJson.data.user_id,
        lastLogin: new Date()
      }
      await updateUser(
        {
          clerkId: bodyJson.data.user_id,
          lastLogin: new Date()
        }
      )
    }
    if (bodyJson.type === 'user.deleted') {
      await deleteUser({ clerkId: bodyJson.data.id })
    }
  } catch (e) {
    console.error('error in user operation', e)
  }
  // Console log the full payload to view
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
