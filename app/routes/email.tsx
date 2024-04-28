import { requireCurrentUser } from '../models/auth.server'
import { type LoaderFunction } from '@remix-run/node'
import { loadPostSummary } from '../models/post.server'

import { mailPost } from '~/utils/mailer'
function textToHtml (text): string {
  return text.split('\n').map(line => `<p style="margin-bottom:.5em">${line}</p>`).join('')
}

export const loader: LoaderFunction = async (args) => {
  await requireCurrentUser(args)
  const post = await loadPostSummary(46)
  const msg = {
    to: 'me@derekscruggs.com',
    dynamic_template_data: {
      name: 'Tameem Rahal', // ${profile.firstName} ${profile.lastName}
      post_url: 'https://trybe-icy-smoke-8833.fly.dev/posts/46',
      // avatar: '<a href="https://trybe-icy-smoke-8833.fly.dev/members/11/content"><img src="https://trybe-icy-smoke-8833.fly.dev/avatars/trybe-bot.png" width="36" height="36"></a>',
      date: '27 April', // format based on user's country
      subject: 'New post from Trybe',
      title: 'A post with a Medium Sized Title', // post.title
      body: textToHtml(post?.body)
    }
  }
  const result = await mailPost(msg)
  console.log('Email sent', result)
  return result
}
