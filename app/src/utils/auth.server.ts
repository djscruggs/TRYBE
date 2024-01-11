import { prisma } from './prisma.server'
import { createUser } from './user.server'
import { RegisterForm, LoginForm } from './types.server'
import bcrypt from 'bcryptjs'
import { redirect, json, createCookieSessionStorage } from '@remix-run/node'


const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be set')
}

const storage = createCookieSessionStorage({
  cookie: {
    name: 'trybe-session',
    secure: process.env.NODE_ENV === 'production',
    secrets: [sessionSecret],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
})
export async function createUserSession(userId: string | number, redirectTo: string) {
  const session = await storage.getSession()
  session.set('userId', userId)
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  })
}
export async function register(user: RegisterForm) {
  const exists = await prisma.user.count({ where: { email:user.email } })
  if (exists) {
    return json({ error: `User already exists with that email` }, { status: 400 })
  }


  const newUser = await createUser(user)
  if (!newUser) {
    return json(
      {
        error: `Something went wrong trying to create a newcurrentUser.`,
        fields: { email:user.email, password:user.password },
      },
      { status: 400 },
    )
  }
  return createUserSession(newUser.id, '/home');
}

export async function login({ email, password, request }: LoginForm) {
  const currentUser = await prisma.user.findUnique({
    where: { email },
  })
  if (!currentUser || !(await bcrypt.compare(password,currentUser.password)))
    return json({ error: `Incorrect login` }, { status: 400 })
  const {URL} = require('url');
  const parsedUrl = new URL(request.url);
  
  let redirect = '/home'
  if(parsedUrl.searchParams){
    const params = parsedUrl.searchParams
    if(params.get('redirectTo')){
      redirect = params.get('redirectTo')
    }
  }
  return createUserSession(currentUser.id, redirect);
}


export async function requireCurrentUser(request: Request, redirectTo: string = new URL(request.url).pathname) {
  const currentUser = await getUser(request)
  const url = require('url');
  const path = url.parse(request.url).pathname
  if (!currentUser) {
    if(!['/login','/register'].includes(path)) {
      const searchParams = new URLSearchParams([['redirectTo', redirectTo]])
      throw redirect(`/login?${searchParams}`)
    }
  }
  return currentUser
}

export function getUserSession(request: Request) {
  return storage.getSession(request?.headers.get('Cookie'))
}

async function getUserId(request: Request) {
  const session = await getUserSession(request)
  const currentUserId = session.get('userId')
  if (!currentUserId) return null
  return currentUserId
}

async function getUser(request: Request) {
  const userId = await getUserId(request)
  if (!userId) {
    return null
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id:userId },
      select: { id: true, email: true, profile: true },
    })
    return user
  } catch {
    return null
  }
}

export async function logout(request: Request) {
  const session = await getUserSession(request)
  return redirect('/login', {
    headers: {
      'Set-Cookie': await storage.destroySession(session),
    },
  })
}