import sgMail from '@sendgrid/mail'

// const FROM_ADDRESS = 'hi@www.jointhetrybe.com'
const FROM_ADDRESS = 'me@derekscruggs.com'

const templates = {
  post: 'd-139902a1da0942a5bd08308598092164'
}
interface PostMailerProps {
  to: string
  replyTo?: string
  dynamic_template_data: {
    name: string
    post_url: string
    date: string
    subject: string
    title: string
    body: string
  }
}

const example_data = {
  to: 'me@derekscruggs.com', // Change to your recipient
  dynamic_template_data: {
    name: 'Tameem Rahal', // ${profile.firstName} ${profile.lastName}
    post_url: 'https://trybe-icy-smoke-8833.fly.dev/posts/46',
    date: '27 April',
    subject: 'New post from Trybe',
    title: 'A post with a Medium Sized Title', // post.title
    body: '<p style="color:red">Some HTML</p>'
  }
}
export async function mailPost (props: PostMailerProps): Promise<any> {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY must be set in environment to use this hook')
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { to, dynamic_template_data, replyTo } = props
  const msg = {
    from: FROM_ADDRESS,
    replyTo,
    to,
    templateId: templates.post,
    dynamic_template_data
  }
  const result = await sgMail.send(msg)
  console.log('Email sent', result)
  return result
}
