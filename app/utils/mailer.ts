import sgMail from '@sendgrid/mail'
import { AxiosHeaders } from 'axios'
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

const TEMPLATES = {
  POST: 'd-139902a1da0942a5bd08308598092164',
  CONTACT_HOST: 'd-149674868c814ae795698747d3c71a65',
  REPLY_NOTIFICATION: 'd-6a5d461f89a1417ab36ebea0a50b64be'
}

function setupEnvironment (): void {
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_NOTIFICATIONS_TO) {
    throw new Error('EMAIL_NOTIFICATIONS_TO must be set in development mode')
  }
  if (process.env.NODE_ENV === 'test') {
    throw new Error('Test environment detected')
  }
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY must be set in environment to use this hook')
  }
  if (!process.env.SENDGRID_FROM_EMAIL) {
    throw new Error('SENDGRID_FROM_EMAIL must be set in environment to use this hook')
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}
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

export async function mailPost (props: PostMailerProps): Promise<any> {
  setupEnvironment()
  if (process.env.NODE_ENV === 'test') {
    return mockSendgridResponse()
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { to, dynamic_template_data, replyTo, fromName } = props
  const msg = {
    from: fromName ? `${fromName} <${process.env.SENDGRID_FROM_EMAIL}>` : process.env.SENDGRID_FROM_EMAIL,
    replyTo,
    to: process.env.NODE_ENV === 'development' ? process.env.EMAIL_NOTIFICATIONS_TO : to,
    templateId: TEMPLATES.POST,
    dynamic_template_data,
    asm: {
      groupId: 29180
    },
    sandbox_mode: {
      enable: !['test', 'development'].includes(process.env.NODE_ENV)
    }
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
  setupEnvironment()
  if (process.env.NODE_ENV === 'test') {
    return mockSendgridResponse()
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { to, dynamic_template_data, replyTo } = props
  const msg = {
    from: process.env.SENDGRID_FROM_EMAIL,
    replyTo: replyTo ?? undefined,
    to: process.env.NODE_ENV === 'development' ? process.env.EMAIL_NOTIFICATIONS_TO : to,
    templateId: TEMPLATES.CONTACT_HOST,
    dynamic_template_data
  }
  const result = await sgMail.send(msg)
  return result[0]
}
export interface CommentReplyMailerProps {
  to: string
  dynamic_template_data: {
    toName: string
    fromName: string
    body: string
    challenge_name: string
    comment_url: string
    subject: string
  }
}
export async function sendCommentReplyNotification (props: CommentReplyMailerProps): Promise<any> {
  setupEnvironment()
  if (process.env.NODE_ENV === 'test') {
    return mockSendgridResponse()
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { to, dynamic_template_data } = props
  const msg = {
    from: process.env.SENDGRID_FROM_EMAIL,
    to: process.env.NODE_ENV === 'development' ? process.env.EMAIL_NOTIFICATIONS_TO : to,
    templateId: TEMPLATES.REPLY_NOTIFICATION,
    dynamic_template_data
  }
  const result = await sgMail.send(msg)
  return result[0]
}

const mockSendgridResponse = (): any => {
  return {
    statusCode: 202,
    body: '',
    headers: {
      server: 'nginx',
      date: new Date().toUTCString(),
      'content-length': '0',
      connection: 'keep-alive',
      'x-message-id': 'NsNyHxBsRlm03Du1je8aIA',
      'access-control-allow-origin': 'https://sendgrid.api-docs.io',
      'access-control-allow-methods': 'POST',
      'access-control-allow-headers': 'Authorization, Content-Type, On-behalf-of, x-sg-elas-acl',
      'access-control-max-age': '600',
      'x-no-cors-reason': 'https://sendgrid.com/docs/Classroom/Basics/API/cors.html',
      'strict-transport-security': 'max-age=600; includeSubDomains'
    }
  }
}
