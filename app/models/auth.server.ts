import { prisma } from './prisma.server'
import { createUser, getUserByClerkId } from './user.server'
import {
  type RegisterForm,
  type LoginForm,
  type CurrentUser
} from '~/utils/types'
import {
  type LoaderFunctionArgs,
  redirect,
  createCookieSessionStorage,
  type Session
} from 'react-router'
import bcrypt from 'bcryptjs'
import { getAuth } from '@clerk/react-router/server'
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
export async function createUserSession(
  userId: string | number,
  redirectTo: string | null
): Promise<Response> {
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
export async function getUserSession(request: Request): Promise<Session> {
  return await storage.getSession(request?.headers.get('Cookie'))
}

export async function register(user: RegisterForm): Promise<Response> {
  const exists = await prisma.user.count({ where: { email: user.email } })
  if (exists) {
    return Response.json(
      { error: 'User already exists with that email' },
      { status: 400 }
    )
  }

  const newUser = await createUser(user)
  if (!newUser) {
    return Response.json(
      {
        error: 'Something went wrong trying to create a new currentUser.',
        fields: { email: user.email, password: user.password }
      },
      { status: 500 }
    )
  }
  return await createUserSession(newUser.id, '/challenges')
}

export async function login({
  email,
  password,
  request
}: LoginForm): Promise<Response> {
  const currentUser = await prisma.user.findUnique({
    where: { email }
  })
  if (!currentUser?.email) {
    return Response.json({ error: 'Incorrect login' }, { status: 400 })
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
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY
    })

    try {
      const result = await clerkClient.users.verifyPassword({
        userId: currentUser.clerkId,
        password
      })
      if (result.verified) {
        void updatePassword(currentUser.id, password)
        return await createUserSession(currentUser.id, '/challenges')
      }
    } catch (error: any) {
      if (currentUser.password) {
        return Response.json(
          { error: error.errors[0]?.shortMessage || 'Incorrect login' },
          { status: 400 }
        )
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
    return redirect(
      `/mobile/oauth/password/${urlSafeHashedEmail}/${currentUser.id}`
    )
  }

  return Response.json({ error: 'Incorrect login' }, { status: 400 })
}

export const updatePassword = async (
  userId: number,
  password: string
): Promise<void> => {
  const hashedPassword = await bcrypt.hash(password, 10)
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  })
}

export async function getCurrentUser(
  args: LoaderFunctionArgs
): Promise<CurrentUser | null> {
  // First try Clerk authentication (works for web and API routes with Clerk tokens)
  const clerkUser = await getAuth(args)
  let dbUser
  if (clerkUser.userId) {
    dbUser = await getUserByClerkId(clerkUser.userId)
    if (dbUser) {
      return dbUser
    }
  }

  // Try to get user from request (checks cookies and Authorization header with user ID)
  dbUser = await getUser(args.request)
  if (dbUser) {
    return dbUser
  }

  // If still no user, check Authorization header directly (for mobile apps sending user ID)
  const userId = await getUserId(args.request)
  if (userId) {
    try {
      dbUser = await prisma.user.findUnique({
        where: { id: Number(userId) },
        include: {
          profile: true,
          memberChallenges: true
        }
      })
      if (dbUser) {
        return dbUser
      }
    } catch (error) {
      console.error('[getCurrentUser] Error looking up user by ID:', error)
    }
  }

  return null
}
export async function requireCurrentUser(
  args: LoaderFunctionArgs
): Promise<CurrentUser | null> {
  const request = args.request
  const currentUser = await getCurrentUser(args)
  if (currentUser) {
    return currentUser
  }
  // if no user, check if the path is allowed
  const path = new URL(request.url).pathname
  const allowedPaths = [
    '/login',
    '/mobile/login',
    '/mobile/signup',
    '/signup',
    '/mobile/oauth'
  ]
  const isAllowedPath = allowedPaths.some((allowedPath) =>
    path.startsWith(allowedPath)
  )
  if (!isAllowedPath) {
    // For API routes, return 401 instead of redirecting
    if (path.startsWith('/api/')) {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw new Response(
        JSON.stringify({
          error: 'Unauthorized',
          message: 'Authentication required'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
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
export async function requireAdminOrValidCohortMembership(
  args: LoaderFunctionArgs
): Promise<CurrentUser | null | Response> {
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
        (membership) => membership.cohortId === Number(args.params.cohortId)
      )
      if (!cohort) {
        doRedirect = true
      }
    }
  }
  if (doRedirect) {
    const goto = args.params.id
      ? `/challenges/v/${args.params.id}`
      : '/challenges'
    return redirect(goto)
  }
  return currentUser
}

async function getUserId(request: Request): Promise<string | null> {
  // First try cookie-based session
  const session = await getUserSession(request)
  const currentUserId = session.get('userId')
  if (currentUserId) return currentUserId

  // Fallback: Check for Authorization header (for mobile apps)
  const authHeader = request.headers.get('Authorization')
  if (authHeader) {
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : authHeader.trim()

    if (token) {
      // Check if it's a Clerk token (starts with "eyJ" for JWT) or a numeric user ID
      if (token.startsWith('eyJ')) {
        // This is a Clerk JWT token - verify it and extract userId
        try {
          const clerkClient = createClerkClient({
            secretKey: process.env.CLERK_SECRET_KEY
          })
          const verifiedToken = await clerkClient.verifyToken(token)
          const clerkUserId = verifiedToken.sub

          // Look up user by clerkId to get database user ID
          const user = await getUserByClerkId(clerkUserId)
          if (user) {
            return String(user.id)
          } else {
            // Return null - user needs to be created in database first
            return null
          }
        } catch (error) {
          console.error('[getUserId] Error verifying Clerk token:', error)
          return null
        }
      } else {
        // Assume it's a numeric user ID
        return token
      }
    }
  }

  // Fallback: Check for X-User-Id header (common mobile pattern)
  const userIdHeader = request.headers.get('X-User-Id')
  if (userIdHeader) {
    return userIdHeader
  }

  // Fallback: Check for X-Session-Id header and extract userId from session
  const sessionIdHeader = request.headers.get('X-Session-Id')
  if (sessionIdHeader) {
    try {
      // Try to get session from the provided session ID
      const session = await storage.getSession(sessionIdHeader)
      const userId = session.get('userId')
      if (userId) return userId
    } catch {
      // Invalid session ID, continue to return null
    }
  }

  return null
}

export async function getUser(request: Request): Promise<CurrentUser | null> {
  const userId = await getUserId(request)
  if (!userId) {
    return null
  }

  try {
    const userIdNumber = Number(userId)
    const user = await prisma.user.findUnique({
      where: { id: userIdNumber },
      include: {
        profile: true,
        memberChallenges: true
      }
    })
    return user
  } catch (error) {
    console.error('[getUser] Error looking up user:', error)
    return null
  }
}

export async function logout(args: {
  request: Request
  redirectUrl?: string
}): Promise<Response> {
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
