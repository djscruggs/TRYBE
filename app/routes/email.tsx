import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction } from '@remix-run/node'
import { loadPostSummary } from '~/models/post.server'
import { json } from '@remix-run/node'
import { mailPost, contactHost, type HostMailerProps } from '~/utils/mailer'
function textToHtml (text): string {
  return text.split('\n').map(line => `<p style="margin-bottom:.5em">${line}</p>`).join('')
}

export const loader: LoaderFunction = async (args) => {
  await requireCurrentUser(args)
  try {
    const msg: HostMailerProps = {
      to: 'me@derekscruggs.com',
      replyTo: 'dj@fourleafequity.com',
      dynamic_template_data: {
        member_name: 'Tameem Rahal',
        subject: 'exercise required?',
        challenge_name: 'Writing challenge',
        body: 'How much exercise will I need to do every day?'
      }
    }
    const result = await contactHost(msg)
    return result
  } catch (error) {
    return json(error, { status: 500 })
  }
}
export const loaderPost: LoaderFunction = async (args) => {
  await requireCurrentUser(args)

  const baseUrl = new URL(args.request.url).origin
  const post = await loadPostSummary(46)
  if (!post) {
    return json({ error: 'Post not found' }, { status: 404 })
  }
  const msg = {
    to: 'me@derekscruggs.com',
    replyTo: 'dj@fourleafequity.com',
    dynamic_template_data: {
      name: 'Tameem Rahal', // ${profile.firstName} ${profile.lastName}
      post_url: `${baseUrl}/posts/46`,
      avatar: '<a href="https://trybe-icy-smoke-8833.fly.dev/members/11/content"><img src="https://trybe-icy-smoke-8833.fly.dev/avatars/trybe-bot.png" width="36" height="36"></a>',
      date: '27 April', // format based on user's country
      subject: 'New post from Trybe',
      title: 'A post with a Medium Sized Title', // post.title
      body: textToHtml(post?.body)
    }
  }
  const result = await mailPost(msg)
  return result
}
