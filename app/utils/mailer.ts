import sgMail from '@sendgrid/mail'

// const example_data = {
//   to: 'me@derekscruggs.com', // Change to your recipient
//   dynamic_template_data: {
//     name: 'Tameem Rahal', // ${profile.firstName} ${profile.lastName}
//     post_url: 'https://trybe-icy-smoke-8833.fly.dev/posts/46',
//     date: '27 April',
//     subject: 'New post from Trybe',
//     title: 'A post with a Medium Sized Title', // post.title
//     body: '<p style="color:red">Some HTML</p>'
//   }
// }

interface PostMailerProps {
  to: string
  replyTo?: string
  fromName?: string
  dynamic_template_data: {
    name: string
    post_url: string
    date: string
    subject: string
    title: string
    body: string
  }
}
const TEMPLATES = {
  POST: 'd-139902a1da0942a5bd08308598092164',
  CONTACT_HOST: 'd-149674868c814ae795698747d3c71a65'
}

export async function mailPost (props: PostMailerProps): Promise<any> {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY must be set in environment to use this hook')
  }
  if (!process.env.SENDGRID_FROM_EMAIL) {
    throw new Error('SENDGRID_FROM_EMAIL must be set in environment to use this hook')
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { to, dynamic_template_data, replyTo, fromName } = props
  const msg = {
    from: fromName ? `${fromName} <${process.env.SENDGRID_FROM_EMAIL}>` : process.env.SENDGRID_FROM_EMAIL,
    replyTo,
    to,
    templateId: TEMPLATES.POST,
    dynamic_template_data
  }
  const result = await sgMail.send(msg)
  return result
}
export interface HostMailerProps {
  to: string
  replyTo?: string
  dynamic_template_data: {
    member_name: string
    body: string
    challenge_name: string
    subject: string
  }
}

export async function contactHost (props: HostMailerProps): Promise<any> {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY must be set in environment to use this hook')
  }
  if (!process.env.SENDGRID_FROM_EMAIL) {
    throw new Error('SENDGRID_FROM_EMAIL must be set in environment to use this hook')
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { to, dynamic_template_data, replyTo } = props
  const msg = {
    from: process.env.SENDGRID_FROM_EMAIL,
    replyTo,
    to,
    templateId: TEMPLATES.CONTACT_HOST,
    dynamic_template_data
  }
  const result = await sgMail.send(msg)
  return result[0]
}
