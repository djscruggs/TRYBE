import { type User } from '@prisma/client'
import { prisma } from '../utils/prisma.server'

export const createUser = async (user: Pick<User, 'email' | 'role' | 'password'>) =>
  await prisma.user.create({
    data: user
  })
