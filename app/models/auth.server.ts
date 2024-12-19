import { prisma } from './prisma.server'
import { createUser, getUserByClerkId } from './user.server'
import { type RegisterForm, type LoginForm, type CurrentUser } from '~/utils/types'
import { type LoaderFunctionArgs, redirect, json, createCookieSessionStorage, type Session } from '@remix-run/node'
import bcrypt from 'bcryptjs'
import { getAuth } from '@clerk/remix/ssr.server'
import { URL } from 'url'

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
    return redirect('/challenges')
  }
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await storage.commitSession(session)
    }
  })
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
  if (!currentUser || !(await bcrypt.compare(String(password), String(currentUser.password)))) { return json({ error: 'Incorrect login' }, { status: 400 }) }
  const parsedUrl = new URL(request.url)

  let redirect = '/challenges'
  if (parsedUrl.searchParams) {
    const params = parsedUrl.searchParams
    if (params.get('redirectTo')) {
      redirect = String(params.get('redirectTo'))
    }
  }
  return await createUserSession(currentUser.id, redirect)
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

  const path = new URL(request.url).pathname
  if (!currentUser) {
    if (!['/login', '/register', '/signup', '/signin'].includes(path)) {
      const url = new URL(request.url)
      const redirectPath = new URL(request.url).pathname
      const urlWithoutPath = `${url.protocol}//${url.host}${url.search}${url.hash}`
      const newUrl = new URL(urlWithoutPath)
      newUrl.searchParams.set('redirectTo', redirectPath)
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw redirect(newUrl.toString())
    }
  }
  return currentUser
}

export async function getUserSession (request: Request): Promise<Session> {
  return await storage.getSession(request?.headers.get('Cookie'))
}

async function getUserId (request: Request): Promise<string | null> {
  const session = await getUserSession(request)
  const currentUserId = session.get('userId')
  console.log('session', session)
  if (!currentUserId) return null
  return currentUserId
}

export async function getUser (request: Request): Promise<CurrentUser | null> {
  const userId = await getUserId(request)
  console.log('userId', userId)
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

export async function logout (args: { request: Request }): Promise<Response> {
  const session = await getUserSession(args.request)
  await storage.destroySession(session)
  return redirect('/signin', {
    headers: {
      'Set-Cookie': await storage.destroySession(session)
    }
  })
}
