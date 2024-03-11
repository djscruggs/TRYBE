import { type User } from '@prisma/client'
import { createUser } from '~/models/user.server'
import { faker } from '@faker-js/faker'

// creates normal users for us
export const createNormalUser = async (user?: Omit<User, 'id'>) => {
  return await createUser({
    email: faker.internet.email().toLowerCase(),
    role: 'USER',
    password: faker.internet.password(),
    ...user
  })
}
// creates admin users for us
export const createAdminUser = async (user?: Omit<User, 'id'>) => {
  return await createUser({
    email: faker.internet.email().toLowerCase(),
    role: 'ADMIN',
    password: faker.internet.password(),
    ...user
  })
}
