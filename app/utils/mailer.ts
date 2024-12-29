import sgMail, { type MailDataRequired, type EmailData } from '@sendgrid/mail'
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
  REPLY_NOTIFICATION: 'd-6a5d461f89a1417ab36ebea0a50b64be',
  CHECKIN_REMINDER: 'd-e0af565878704bfd85ea71146ccff90f',
  WELCOME: 'd-fd916ab44ef2481ea8c79c7603094732',
  CHALLENGE_WELCOME: 'd-c0d3fd810fbd4c98ab97a7040f8dc1fc'
}

function setupEnvironment (): void {
  if (process.env.NODE_ENV === 'test') {
    return
  }
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_NOTIFICATIONS_TO) {
    throw new Error('EMAIL_NOTIFICATIONS_TO must be set in development mode')
  }
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY must be set in environment to use this hook')
  }
  if (!process.env.SENDGRID_FROM_EMAIL) {
    throw new Error('SENDGRID_FROM_EMAIL must be set in environment to use this hook')
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}
async function sendEmail (msg: MailDataRequired): Promise<any> {
  if (process.env.NODE_ENV === 'test') {
    console.log('Test environment detected, using mockSendgridResponse')
    return mockSendgridResponse()
  }
  if (process.env.NODE_ENV === 'development') {
    console.log('Sending email', msg)
  }
  return await sgMail.send(msg)
}

interface PostMailerProps {
  to: EmailData
  replyTo?: EmailData
  fromName?: EmailData
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
  const result = await sendEmail(msg as MailDataRequired)
  return result[0]
}
export interface HostMailerProps {
  to: EmailData
  replyTo?: EmailData
  dynamic_template_data: {
    member_name: string
    body: string
    challenge_name: string
    subject: string
  }
}

export async function contactHost (props: HostMailerProps): Promise<any> {
  setupEnvironment()
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { to, dynamic_template_data, replyTo } = props
  const msg = {
    from: process.env.SENDGRID_FROM_EMAIL,
    replyTo: replyTo ?? undefined,
    to: process.env.NODE_ENV === 'development' ? process.env.EMAIL_NOTIFICATIONS_TO : to,
    templateId: TEMPLATES.CONTACT_HOST,
    dynamic_template_data
  }
  const result = await sendEmail(msg as MailDataRequired)
  return result[0]
}
export interface CommentReplyMailerProps {
  to: EmailData
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
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { to, dynamic_template_data } = props
  const msg = {
    from: process.env.SENDGRID_FROM_EMAIL,
    to: process.env.NODE_ENV === 'development' ? process.env.EMAIL_NOTIFICATIONS_TO : to,
    templateId: TEMPLATES.REPLY_NOTIFICATION,
    dynamic_template_data
  }
  const result = await sendEmail(msg as MailDataRequired)
  return result[0]
}

export interface CheckinReminderMailerProps {
  to: EmailData
  dynamic_template_data: {
    name: string
    challenge_name: string
    checkin_url: string
  }
}

export async function sendCheckinReminder (props: CheckinReminderMailerProps): Promise<any> {
  setupEnvironment()
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { to, dynamic_template_data } = props
  const msg = {
    from: process.env.SENDGRID_FROM_EMAIL,
    to: process.env.NODE_ENV === 'development' ? process.env.EMAIL_NOTIFICATIONS_TO : to,
    templateId: TEMPLATES.CHECKIN_REMINDER,
    dynamic_template_data
  }
  const result = await sendEmail(msg as MailDataRequired)
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
export interface WelcomeMailerProps {
  to: EmailData
}

export async function sendWelcomeEmail (props: WelcomeMailerProps): Promise<any> {
  setupEnvironment()
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { to } = props
  const msg = {
    from: process.env.SENDGRID_FROM_EMAIL,
    fromName: 'Trybe',
    to: process.env.NODE_ENV === 'development' ? process.env.EMAIL_NOTIFICATIONS_TO : to,
    templateId: TEMPLATES.WELCOME
  }
  const result = await sendEmail(msg as MailDataRequired)
  return result[0]
}

export interface ChallengeWelcomeMailerProps {
  to: EmailData
  dynamic_template_data: {
    challengeName: string
    startDate: string
    duration: string
    description: string
  }
}

export async function sendChallengeWelcome (props: ChallengeWelcomeMailerProps): Promise<any> {
  setupEnvironment()
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { to, dynamic_template_data } = props
  const msg = {
    from: process.env.SENDGRID_FROM_EMAIL,
    fromName: 'Trybe',
    to: process.env.NODE_ENV === 'development' ? process.env.EMAIL_NOTIFICATIONS_TO : to,
    templateId: TEMPLATES.CHALLENGE_WELCOME,
    dynamic_template_data
  }
  const result = await sendEmail(msg as MailDataRequired)
  return result[0]
}
