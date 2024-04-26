import { requireCurrentUser } from '../models/auth.server'
import { type LoaderFunction } from '@remix-run/node'
import sgMail from '@sendgrid/mail'

export const loader: LoaderFunction = async (args) => {
  await requireCurrentUser(args)
  console.log('API KEY', process.env.SENDGRID_API_KEY)
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  const msg = {
    to: 'me@derekscruggs.com', // Change to your recipient
    from: 'me@derekscruggs.com', // Change to your verified sender
    subject: 'Sending with SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>'
  }
  const result = await sgMail.send(msg)
  console.log('Email sent', result)
  return json(result)
}
