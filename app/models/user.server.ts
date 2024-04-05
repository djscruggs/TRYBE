// app/utils/user.server.ts
import bcrypt from 'bcryptjs'
import type { RegisterForm } from '../utils/types.server'
import { prisma } from './prisma.server'

export const createUser = async (user: RegisterForm | prisma.UserCreateInput): Promise<{ id: number, email: string }> => {
  let passwordHash = null
  if (user.password) {
    passwordHash = await bcrypt.hash(String(user.password), 10)
  }
  const data = {
    email: user.email,
    password: passwordHash,
    clerkId: user.clerkId,
    profile: {
      create: {
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage
      }
    }
  }
  const newUser = await prisma.user.create({ data })
  return { id: newUser.id, email: user.email }
}

export const loadUser = async (userId: string | number | undefined): Promise<prisma.User> => {
  if (!userId) return null
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { id: true, email: true, profile: true, memberChallenges: true }
    })
    return user
  } catch (err) {
    console.log('error loading user', err)
    return null
  }
}

export const getUserByClerkId = async (clerkId: string): Promise<prisma.User> => {
  return await prisma.user.findFirst({ where: { clerkId }, include: { profile: true } })
}
export const updateUser = async (object: prisma.UserUpdateInput): Promise<prisma.User> => {
  const { id, clerkId, ...data } = object.user
  if (!id && !clerkId) {
    throw new Error('User ID or Clerk ID is required')
  }
  console.log('updating user with id & clerkId', id, clerkId)
  let where: prisma.UserWhereInput
  if (id) {
    where = { id }
  } else if (clerkId) {
    where = { clerkId }
  }
  const include = { profiles: true }
  console.log('in update where is', where)
  console.log('in update data is', data)
  return await prisma.user.updateMany({ where, data, include })
}
export const deleteUser = async (user: prisma.UserUpdateInput): Promise<prisma.User> => {
  if (!user.id && !user.clerkId) {
    throw new Error('User ID or Clerk ID is required')
  }
  let where: prisma.UserWhereInput
  if (user.id) {
    where = { id: user.id }
  } else if (user.clerkId) {
    where = { clerkId: user.clerkId }
  }
  console.log('in delete where is', where)
  return await prisma.user.deleteMany({ where })
}
