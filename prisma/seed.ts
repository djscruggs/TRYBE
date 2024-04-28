import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main () {
  const bot = await prisma.user.upsert({
    where: { email: 'hi@www.jointhetrybe.com' },
    update: {},
    create: {
      email: 'hi@www.jointhetrybe.com',
      role: 'USER',
      profile: {
        create: {
          firstName: 'Trybe',
          lastName: 'Bot',
          profileImage: '/trybe-bot.png'
        }
      }
    }
  })
  console.log({ bot })
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
