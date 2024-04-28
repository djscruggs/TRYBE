import { requireCurrentUser } from '../models/auth.server'
import { type LoaderFunction } from '@remix-run/node'
import sgMail from '@sendgrid/mail'
import { loadPostSummary } from '../models/post.server'

import { mailPost } from '~/utils/mailer'
function textToHtml (text) {
  return text.split('\n').map(line => `<p style="margin-bottom:.5em">${line}</p>`).join('')
}

export const loader: LoaderFunction = async (args) => {
  await requireCurrentUser(args)
  const post = await loadPostSummary(46)
  console.log('API KEY', process.env.SENDGRID_API_KEY)

  sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
  const msg = {
    to: 'me@derekscruggs.com',
    dynamic_template_data: {
      name: 'Tameem Rahal', // ${profile.firstName} ${profile.lastName}
      post_url: 'https://trybe-icy-smoke-8833.fly.dev/posts/46',
      // avatar: '<a href="https://trybe-icy-smoke-8833.fly.dev/members/11/content"><img src="https://trybe-icy-smoke-8833.fly.dev/avatars/trybe-bot.png" width="36" height="36"></a>',
      date: '27 April', // format based on user's country
      subject: 'New post from Trybe',
      title: 'A post with a Medium Sized Title', // post.title
      body: textToHtml(post.body)
    }
  }
  const result = await mailPost(msg)
  console.log('Email sent', result)
  return result
}
