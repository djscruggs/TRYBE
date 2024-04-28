import { prisma } from './prisma.server'
import { createUser, getUserByClerkId } from './user.server'
import { type RegisterForm, type LoginForm } from '../utils/types'
import bcrypt from 'bcryptjs'
import type { User } from '~/utils/types'
import { redirect, json, createCookieSessionStorage } from '@remix-run/node'
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
    return redirect('/home')
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
  return await createUserSession(newUser.id, '/home')
}

export async function login ({ email, password, request }: LoginForm): Promise<Response> {
  const currentUser = await prisma.user.findUnique({
    where: { email }
  })
  if (!currentUser || !(await bcrypt.compare(String(password), String(currentUser.password)))) { return json({ error: 'Incorrect login' }, { status: 400 }) }
  const parsedUrl = new URL(request.url)

  let redirect = '/home'
  if (parsedUrl.searchParams) {
    const params = parsedUrl.searchParams
    if (params.get('redirectTo')) {
      redirect = String(params.get('redirectTo'))
    }
  }
  return await createUserSession(currentUser.id, redirect)
}

export async function requireCurrentUser (args): Promise< User | null> {
  const request = args.request
  const redirectTo = args.redirectTo || new URL(request.url).pathname
  const clerkUser = await getAuth(args)
  let dbUser
  if (!clerkUser.userId) {
    dbUser = await getUser(request)
  } else {
    dbUser = await getUserByClerkId(clerkUser.userId)
  }
  const currentUser = dbUser

  const url = require('url')
  const path = url.parse(request.url).pathname
  if (!currentUser) {
    if (!['/login', '/register', 'signup', 'signin'].includes(path)) {
      const searchParams = new URLSearchParams([['redirectTo', redirectTo]])
      console.log('redirecting')
      throw redirect(`/signin?${searchParams}`)
    } else {
      console.log('NOT redirecting')
    }
  }
  return currentUser
}

export async function getUserSession (request: Request) {
  return await storage.getSession(request?.headers.get('Cookie'))
}

async function getUserId (request: Request) {
  const session = await getUserSession(request)
  const currentUserId = session.get('userId')
  if (!currentUserId) return null
  return currentUserId
}

export async function getUser (request: Request, memberChallenges = false) {
  const userId = await getUserId(request)
  if (!userId) {
    return null
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, profile: true, memberChallenges }
    })
    return user
  } catch {
    return null
  }
}

export async function logout (args: any) {
  const session = await getUserSession(args.request)
  await storage.destroySession(session)
  return redirect('/signin', {
    headers: {
      'Set-Cookie': await storage.destroySession(session)
    }
  })
}
