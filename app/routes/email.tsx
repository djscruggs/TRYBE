import { requireCurrentUser } from '../models/auth.server'
import { type LoaderFunction } from '@remix-run/node'
import sgMail from '@sendgrid/mail'
import { loadPostSummary } from '../models/post.server'

function textToHtml (text) {
  return text.split('\n').map(line => `<p>${line}</p>`).join('')
}

export const loader: LoaderFunction = async (args) => {
  await requireCurrentUser(args)
  const post = await loadPostSummary(46)
  console.log('API KEY', process.env.SENDGRID_API_KEY)

  sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
  const msg = {
    to: 'me@derekscruggs.com', // Change to your recipient
    from: 'me@derekscruggs.com', // Change to your verified sender
    templateId: 'd-3cd8da2003704245af264a66719f3d36',
    dynamic_template_data: {
      subject: 'New post from Trybe',
      body: textToHtml(post.body)
    }
  }
  const result = await sgMail.send(msg)
  console.log('Email sent', result)
  return result
}
