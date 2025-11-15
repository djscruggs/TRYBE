import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // ... you will write your Prisma Client queries here
  // await prisma.user.create({
  //   data: {
  //     name: 'Tameem Rahal',
  //     email: 'tameem.rahal@gmail.com ',
  //     role: 'ADMIN',
  //     posts: {
  //       create: { title: 'Hello from Tameem!' },
  //     },
  //     profile: {
  //       create: { bio: 'I love Trybe!' },
  //     },
  //   },
  // })

  const post = await prisma.post.update({
    where: { id: 2 },
    data: { published: true }
  })

  const allUsers = await prisma.user.findMany({
    include: {
      posts: true,
      profile: true
    }
  })
  console.dir(allUsers, { depth: null })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
