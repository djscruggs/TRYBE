import { prisma } from './prisma.server'
import { createUser, getUserByClerkId } from './user.server'
import { type RegisterForm, type LoginForm, type CurrentUser } from '~/utils/types'
import { type LoaderFunctionArgs, redirect, json, createCookieSessionStorage, type Session } from '@remix-run/node'
import bcrypt from 'bcryptjs'
import { getAuth } from '@clerk/remix/ssr.server'
import { URL } from 'url'
import { createClerkClient } from '@clerk/backend'

const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be set')
}

export const storage = createCookieSessionStorage({
  cookie: {
    name: 'trybe-session',
    secure: process.env.NODE_ENV === 'production',
    secrets: [sessionSecret],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true
  }
})
export async function createUserSession (userId: string | number, redirectTo: string | null): Promise<Response> {
  const session = await storage.getSession()
  session.set('userId', userId)
  if (!redirectTo) {
    redirectTo = '/challenges'
  }
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await storage.commitSession(session)
    }
  })
}
export async function getUserSession (request: Request): Promise<Session> {
  return await storage.getSession(request?.headers.get('Cookie'))
}

export async function register (user: RegisterForm): Promise<Response> {
  const exists = await prisma.user.count({ where: { email: user.email } })
  if (exists) {
    return json({ error: 'User already exists with that email' }, { status: 400 })
  }

  const newUser = await createUser(user)
  if (!newUser) {
    return json(
      {
        error: 'Something went wrong trying to create a newcurrentUser.',
        fields: { email: user.email, password: user.password }
      },
      { status: 400 }
    )
  }
  return await createUserSession(newUser.id, '/challenges')
}

export async function login ({ email, password, request }: LoginForm): Promise<Response> {
  const currentUser = await prisma.user.findUnique({
    where: { email }
  })
  if (!currentUser?.email) {
    return json({ error: 'Incorrect login' }, { status: 400 })
  }
  if (await bcrypt.compare(String(password), String(currentUser.password))) {
    const parsedUrl = new URL(request.url)
    let redirectTo = '/challenges'
    if (parsedUrl.searchParams) {
      const params = parsedUrl.searchParams
      if (params.get('redirectTo')) {
        redirectTo = String(params.get('redirectTo'))
      }
    }
    return await createUserSession(currentUser.id, redirectTo)
  }
  // try to validate with clerk  if it's a clerk user
  if (currentUser.clerkId) {
    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

    try {
      const result = await clerkClient.users.verifyPassword({ userId: currentUser.clerkId, password })
      if (result.verified) {
        void updatePassword(currentUser.id, password)
        return await createUserSession(currentUser.id, '/challenges')
      }
    } catch (error: any) {
      if (currentUser.password) {
        return json({ error: error.errors[0].shortMessage || 'Incorrect login' }, { status: 400 })
      }
    }
  }
  // special handling for clerk users who have not set a password
  if (currentUser.clerkId && currentUser.password === null) {
    // redirect to route for setting up password
    // hash the email address so it can't be spoofed
    const hashedEmail = await bcrypt.hash(currentUser.email, 10)
    // Convert to URL-safe Base64
    const urlSafeHashedEmail = Buffer.from(hashedEmail).toString('base64url')
    // delete previous tokens
    await prisma.passwordResetToken.deleteMany({
      where: { userId: currentUser.id }
    })
    // create new token
    await prisma.passwordResetToken.create({
      data: {
        userId: currentUser.id,
        token: urlSafeHashedEmail,
        expiresAt: new Date(Date.now() + 1000 * 60 * 30) // 30 minutes
      }
    })
    return redirect(`/mobile/oauth/password/${urlSafeHashedEmail}/${currentUser.id}`)
  }

  return json({ error: 'Incorrect login' }, { status: 400 })
}

export const updatePassword = async (userId: number, password: string): Promise<void> => {
  const hashedPassword = await bcrypt.hash(password, 10)
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  })
}

export async function getCurrentUser (args: LoaderFunctionArgs): Promise<CurrentUser | null> {
  const request = args.request
  const clerkUser = await getAuth(args)
  let dbUser
  if (!clerkUser.userId) {
    dbUser = await getUser(request)
  } else {
    dbUser = await getUserByClerkId(clerkUser.userId)
  }
  return dbUser
}
export async function requireCurrentUser (args: LoaderFunctionArgs): Promise<CurrentUser | null> {
  const request = args.request
  const currentUser = await getCurrentUser(args)
  if (currentUser) {
    return currentUser
  }
  // if no user, check if the path is allowed
  const path = new URL(request.url).pathname
  const allowedPaths = ['/login', '/mobile/login', '/mobile/signup', '/signup', '/mobile/oauth']
  const isAllowedPath = allowedPaths.some(allowedPath => path.startsWith(allowedPath))
  if (!isAllowedPath) {
    const url = new URL(request.url)
    const redirectPath = new URL(request.url).pathname
    const urlWithoutPath = `${url.protocol}//${url.host}${url.search}${url.hash}`
    const newUrl = new URL(urlWithoutPath)
    newUrl.searchParams.set('redirectTo', redirectPath)
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw redirect(newUrl.toString())
  }
  return currentUser
}
export async function requireAdminOrValidCohortMembership (args: LoaderFunctionArgs): Promise<CurrentUser | null | Response> {
  const currentUser = await getCurrentUser(args)
  if (!args.params.cohortId) {
    return currentUser
  }
  if (!currentUser) {
    return null
  }
  // check that this is a valid cohort
  const thisCohort = await prisma.cohort.findUnique({
    where: { id: Number(args.params.cohortId) }
  })
  let doRedirect = false
  if (!thisCohort) {
    doRedirect = true
  }
  if (!doRedirect) {
    if (currentUser.role !== 'ADMIN') {
      const cohort = currentUser.memberChallenges?.find(
        membership => membership.cohortId === Number(args.params.cohortId)
      )
      if (!cohort) {
        doRedirect = true
      }
    }
  }
  if (doRedirect) {
    const goto = args.params.id ? `/challenges/v/${args.params.id}` : '/challenges'
    return redirect(goto)
  }
  return currentUser
}

async function getUserId (request: Request): Promise<string | null> {
  const session = await getUserSession(request)
  const currentUserId = session.get('userId')
  if (!currentUserId) return null
  return currentUserId
}

export async function getUser (request: Request): Promise<CurrentUser | null> {
  const userId = await getUserId(request)
  if (!userId) {
    return null
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: {
        profile: true,
        memberChallenges: true
      }
    })
    return user
  } catch {
    return null
  }
}

export async function logout (args: { request: Request, redirectUrl?: string }): Promise<Response> {
  const session = await getUserSession(args.request)
  await storage.destroySession(session)
  if (!args.redirectUrl) {
    args.redirectUrl = '/login'
  }
  return redirect(args.redirectUrl, {
    headers: {
      'Set-Cookie': await storage.destroySession(session)
    }
  })
}
