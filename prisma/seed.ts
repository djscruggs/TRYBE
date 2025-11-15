import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main(): Promise<void> {
  try {
    await prisma.category.createMany({
      data: [
        { id: 1, name: 'Meditation' },
        { id: 2, name: 'Journal' },
        { id: 3, name: 'Creativity' },
        { id: 4, name: 'Health' }
      ]
    })
  } catch (e) {
    console.log(e)
  }
  await prisma.user.upsert({
    where: { id: 1 },
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
  await prisma.user.upsert({
    where: { id: 2 },
    update: {},
    create: {
      email: 'me@derekscruggs.com',
      role: 'ADMIN',
      profile: {
        create: {
          firstName: 'DJ',
          lastName: 'Scruggs'
        }
      }
    }
  })
  await prisma.user.upsert({
    where: { id: 3 },
    update: {},
    create: {
      email: 'tameem.rahal@gmail.com',
      role: 'ADMIN',
      profile: {
        create: {
          firstName: 'Tameem',
          lastName: 'Rahal'
        }
      }
    }
  })
  await prisma.challenge.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Meditation Challenge (scheduled)',
      description: 'This is a 30 day meditation challenge',
      type: 'SCHEDULED',
      status: 'PUBLISHED',
      startAt: new Date(),
      endAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30),
      userId: 2,
      public: true,
      icon: 'People-07.png',
      color: 'orange'
    }
  })
  await prisma.challenge.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: 'Running Challenge',
      description: 'This is a 30 day running challenge',
      type: 'SCHEDULED',
      status: 'PUBLISHED',
      startAt: new Date(),
      endAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30),
      userId: 2,
      public: true,
      icon: 'People-11.png',
      color: 'orange'
    }
  })
  await prisma.challenge.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      name: 'Writing Challenge',
      description: 'This is a 30 day writing challenge (self-paced)',
      type: 'SELF_LED',
      status: 'PUBLISHED',
      startAt: null,
      endAt: null,
      userId: 2,
      public: true,
      icon: 'People-12.png',
      color: 'orange',
      numDays: 30
    }
  })
  await prisma.challenge.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      name: 'Doodle Challenge',
      description: 'This is a 30 day drawing challenge (self-paced)',
      type: 'SELF_LED',
      status: 'PUBLISHED',
      startAt: null,
      endAt: null,
      userId: 2,
      public: true,
      icon: 'People-14.png',
      color: 'orange',
      numDays: 30
    }
  })
  try {
    await prisma.categoriesOnChallenges.createMany({
      data: [
        { challengeId: 1, categoryId: 1 },
        { challengeId: 2, categoryId: 2 },
        { challengeId: 3, categoryId: 3 },
        { challengeId: 4, categoryId: 4 }
      ]
    })
  } catch (e) {
    console.log(e)
  }
  await prisma.post.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: 'Day 1 of Running Challenge',
      body: 'This here is the first day of the running challenge. I am so excited to start this journey!',
      userId: 2,
      challengeId: 2,
      publishOnDayNumber: 1,
      published: true
    }
  })
  await prisma.post.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      title: 'Day 2 of Running Challenge',
      body: 'This here is the second day of the running challenge. Pump it up!',
      userId: 2,
      challengeId: 2,
      publishOnDayNumber: 2,
      published: true
    }
  })
  await prisma.memberChallenge.upsert({
    where: { id: 1 },
    update: {},
    create: {
      challengeId: 2,
      userId: 2
    }
  })
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
