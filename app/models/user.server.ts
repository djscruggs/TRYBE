// app/utils/user.server.ts
import bcrypt from 'bcryptjs'
import type { RegisterForm } from '../utils/types.server'
import { prisma } from './prisma.server'
console.log(prisma)

export const createUser = async (user: RegisterForm | prisma.UserCreateInput): Promise<{ id: number, email: string }> => {
  return { created: true }
  // console.log('prisma.user', prisma.user)
  // let passwordHash = null
  // if (user.password) {
  //   passwordHash = await bcrypt.hash(String(user.password), 10)
  // }
  // console.log('in createUser, submitted user is', user)
  // const data = {
  //   email: user.email,
  //   password: passwordHash,
  //   clerkId: user.clerkId,
  //   profile: {
  //     create: {
  //       firstName: user.firstName,
  //       lastName: user.lastName,
  //       profileImage: user.profileImage
  //     }
  //   }
  // }
  // console.log('data', data)
  // const newUser = await prisma.user.create({ data })
  // console.log('newUser', newUser)
  // return { id: newUser.id, email: user.email }
}
export const createUser2 = async (user: RegisterForm | prisma.UserCreateInput): Promise<{ id: string, email: string }> => {
  let passwordHash = null
  if (user.password) {
    passwordHash = await bcrypt.hash(String(user.password), 10)
  }
  const newUser = await prisma.user.create({
    data: {
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
  })
  console.log('newUser', newUser)
  return { id: newUser.id, email: user.email }
}
export const loadUser = async (userId: string): Promise<prisma.User> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, profile: true, memberChallenges: true }
    })
    return user
  } catch {
    return null
  }
}
export const getUserByClerkId = async (clerkId: string): Promise<prisma.User> => {
  return await prisma.user.findFirst({ where: { clerkId }, include: { profile: true } })
}
export const updateUser = async (user: prisma.UserUpdateInput): Promise<prisma.User> => {
  const { id, clerkId, ...data } = user
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
  console.log('in update where is', where)
  console.log('in update data is', data)
  return await prisma.user.updateMany({ where, data })
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
